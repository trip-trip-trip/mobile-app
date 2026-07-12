#!/usr/bin/env python3
"""여행 장소(CITY) 썸네일 수집 스크립트.

백엔드 `GET /trips/places`에서 장소 목록을 받아, 한국어 위키백과에서
장소당 대표 이미지 1장을 찾아 `assets/images/places/{id}.{ext}`로 내려받고
`constants/placeImages.ts` (id → require 매핑)를 자동 생성한다.

이미지 출처는 Wikipedia/Wikimedia Commons(자유 라이선스)이며, 장소별
출처 정보는 `assets/images/places/credits.json`에 기록된다.

사용법:
  python3 scripts/fetch_place_images.py             # 전체 수집 (이미 받은 파일은 skip)
  python3 scripts/fetch_place_images.py --force     # 전부 재다운로드
  python3 scripts/fetch_place_images.py --size 640  # 썸네일 가로폭 변경 (기본 320px)
  python3 scripts/fetch_place_images.py --limit 10  # 앞 10개만 (테스트용)

외부 패키지 의존성 없음 (표준 라이브러리만 사용).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = SCRIPT_DIR.parent  # tripshot/
IMAGES_DIR = APP_DIR / "assets" / "images" / "places"
TS_OUT = APP_DIR / "constants" / "placeImages.ts"
CREDITS_OUT = IMAGES_DIR / "credits.json"
DATA_SQL = APP_DIR.parent / "backend-v2" / "src" / "main" / "resources" / "data.sql"

PLACES_API = "https://backend-v2-production-789a.up.railway.app/trips/places"
WIKI_API = "https://ko.wikipedia.org/w/api.php"
USER_AGENT = "TripshotThumbFetcher/1.0 (tripshot app; akea1027th@gmail.com)"

REQUEST_INTERVAL = 0.3  # Wikimedia API 에티켓: 순차 요청 + 간격
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# 위키 문서 제목이 자동 후보로 안 잡히는 장소는 여기에 추가한다.
# 키: (부모지역명, 장소명) 또는 장소명 단독. 값: 위키 문서 제목.
MANUAL_TITLES: dict[tuple[str, str] | str, str] = {
    "발리": "발리섬",
    "코모도": "코모도섬",
    "보라카이": "보라카이섬",
    "고아": "고아주",
    "케랄라": "케랄라주",
    "홉스굴": "홉스굴호",
    "마마누카": "마마누카 제도",
    "크루거": "크루거 국립공원",
    "암보셀리": "암보셀리 국립공원",
    "세렝게티": "세렝게티 국립공원",
    "마사이마라": "마사이마라 국립보호구",
    "와디럼": "와디 럼",
    "아타카마": "아타카마 사막",
    "토레스델파이네": "토레스 델 파이네 국립공원",
    "이스터섬": "이스터섬",
    "이구아수": "이구아수 폭포",
    ("일본", "나라"): "나라시",
    ("스리랑카", "캔디"): "캔디 (스리랑카)",
    ("스리랑카", "갈레"): "갈레 (스리랑카)",
    ("멕시코", "툴룸"): "툴룸",
    ("피지", "나디"): "난디 (피지)",
}

# 한국어 위키에 쓸만한 사진이 없는 장소 → 영어 위키백과 문서 제목 (최후 fallback)
EN_TITLES: dict[tuple[str, str] | str, str] = {
    ("부산광역시", "북구"): "Buk District, Busan",
    ("태국", "푸켓"): "Phuket City",
    ("스리랑카", "캔디"): "Kandy",
    ("스리랑카", "갈레"): "Galle",
    ("멕시코", "툴룸"): "Tulum",
    ("코스타리카", "마누엘안토니오"): "Manuel Antonio National Park",
    ("코스타리카", "타마린도"): "Tamarindo, Costa Rica",
    ("파나마", "보케테"): "Boquete District",
    ("피지", "나디"): "Nadi",
    ("피지", "마마누카"): "Mamanuca Islands",
}

# 국기/지도/휘장 등 썸네일로 부적합한 이미지 파일명 패턴
BAD_IMAGE_RE = re.compile(
    r"(flag|locator|location|map|seal|emblem|logo|coat[_ ]of[_ ]arms|"
    r"symbol|\.svg$|지도|휘장|문장|깃발)",
    re.IGNORECASE,
)

session_last_request = 0.0


def http_get(url: str) -> bytes:
    """UA 헤더 + 요청 간격 + 429 백오프 재시도를 지키는 GET."""
    global session_last_request
    for attempt in range(4):
        wait = REQUEST_INTERVAL - (time.monotonic() - session_last_request)
        if wait > 0:
            time.sleep(wait)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as res:
                body = res.read()
            session_last_request = time.monotonic()
            return body
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                backoff = 5 * (attempt + 1)
                print(f"    (429 rate limit — {backoff}초 대기 후 재시도)")
                time.sleep(backoff)
                session_last_request = time.monotonic()
                continue
            raise
    raise RuntimeError("unreachable")


def wiki_query(params: dict, api: str = WIKI_API) -> dict:
    params = {"format": "json", **params}
    url = api + "?" + urllib.parse.urlencode(params)
    return json.loads(http_get(url))


# ---------------------------------------------------------------- 장소 목록


def load_places() -> list[dict]:
    """프로덕션 API 우선, 실패 시 backend-v2/data.sql 파싱."""
    try:
        data = json.loads(http_get(PLACES_API))
        places = data["result"]
        print(f"[places] API에서 {len(places)}개 로드")
        return places
    except Exception as e:  # noqa: BLE001
        print(f"[places] API 실패({e}) → data.sql 파싱 시도")

    sql = DATA_SQL.read_text(encoding="utf-8")
    places = []
    # INSERT INTO places (id, name, type, parent_id) VALUES (1, '대한민국', 'COUNTRY', NULL);
    for m in re.finditer(
        r"INSERT INTO places\s*\(id, name, type, parent_id\)\s*"
        r"VALUES\s*\((\d+),\s*'([^']+)',\s*'(\w+)',\s*(NULL|\d+)\)",
        sql,
        re.IGNORECASE,
    ):
        pid = m.group(4)
        places.append(
            {
                "id": int(m.group(1)),
                "name": m.group(2),
                "type": m.group(3),
                "parentId": None if pid.upper() == "NULL" else int(pid),
            }
        )
    if not places:
        sys.exit("장소 목록을 가져오지 못했습니다 (API/data.sql 모두 실패).")
    print(f"[places] data.sql에서 {len(places)}개 로드")
    return places


# ---------------------------------------------------------------- 이미지 검색


def acceptable(page: dict) -> bool:
    """썸네일이 있고, 국기/지도류가 아닌 페이지인지."""
    thumb = page.get("thumbnail", {}).get("source")
    image_name = page.get("pageimage", "")
    return bool(thumb) and not BAD_IMAGE_RE.search(image_name)


def resolve_pages(result: dict) -> dict[str, dict]:
    """API 응답의 normalized/redirects 매핑을 따라 요청 title → page dict."""
    query = result.get("query", {})
    mapping: dict[str, str] = {}
    for entry in query.get("normalized", []) + query.get("redirects", []):
        mapping[entry["from"]] = entry["to"]

    def follow(title: str) -> str:
        seen = set()
        while title in mapping and title not in seen:
            seen.add(title)
            title = mapping[title]
        return title

    by_title = {p.get("title"): p for p in query.get("pages", {}).values()}
    return {t: by_title.get(follow(t), {}) for t in list(by_title) + list(mapping)}


def article_image(page_title: str, size: int) -> tuple[str, str] | None:
    """문서 대표 이미지가 지도/휘장뿐일 때, 본문 이미지 중 사진(jpg)을 선택."""
    result = wiki_query(
        {"action": "query", "titles": page_title, "prop": "images", "imlimit": 50}
    )
    files = [
        img["title"]
        for p in result.get("query", {}).get("pages", {}).values()
        for img in p.get("images", [])
        if img["title"].lower().endswith((".jpg", ".jpeg"))
        and not BAD_IMAGE_RE.search(img["title"])
    ]
    if not files:
        return None
    result = wiki_query(
        {
            "action": "query",
            "titles": "|".join(files[:10]),
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": size,
        }
    )
    for p in result.get("query", {}).get("pages", {}).values():
        for info in p.get("imageinfo", []):
            if info.get("thumburl"):
                return page_title, info["thumburl"]
    return None


def wikidata_image(page_title: str, size: int) -> tuple[str, str] | None:
    """ko.wiki 문서에 사진이 없을 때 Wikidata 대표 이미지(P18)를 가져온다."""
    result = wiki_query(
        {
            "action": "query",
            "titles": page_title,
            "prop": "pageprops",
            "ppprop": "wikibase_item",
        }
    )
    qid = next(
        (
            p.get("pageprops", {}).get("wikibase_item")
            for p in result.get("query", {}).get("pages", {}).values()
        ),
        None,
    )
    if not qid:
        return None
    claims = wiki_query(
        {"action": "wbgetclaims", "entity": qid, "property": "P18"},
        api=WIKIDATA_API,
    )
    p18 = claims.get("claims", {}).get("P18", [])
    filename = next(
        (
            c["mainsnak"]["datavalue"]["value"]
            for c in p18
            if c.get("mainsnak", {}).get("datavalue")
        ),
        None,
    )
    if not filename or BAD_IMAGE_RE.search(filename):
        return None
    result = wiki_query(
        {
            "action": "query",
            "titles": f"File:{filename}",
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": size,
        },
        api=COMMONS_API,
    )
    for p in result.get("query", {}).get("pages", {}).values():
        for info in p.get("imageinfo", []):
            if info.get("thumburl"):
                return page_title, info["thumburl"]
    return None


def find_thumbnail(name: str, parent: str, size: int) -> tuple[str, str] | None:
    """장소 이름으로 위키백과 대표 이미지 검색. (문서제목, 썸네일URL) 반환."""
    candidates: list[str] = []
    override = MANUAL_TITLES.get((parent, name)) or MANUAL_TITLES.get(name)
    if override:
        candidates.append(override)
    candidates += [name, f"{name} ({parent})", f"{parent} {name}"]

    result = wiki_query(
        {
            "action": "query",
            "titles": "|".join(dict.fromkeys(candidates)),
            "prop": "pageimages",
            "piprop": "thumbnail|name",
            "pithumbsize": size,
            "redirects": 1,
        }
    )
    query = result.get("query", {})
    mapping = {
        e["from"]: e["to"]
        for e in query.get("normalized", []) + query.get("redirects", [])
    }
    by_title = {p.get("title"): p for p in query.get("pages", {}).values()}

    def page_for(title: str) -> dict:
        seen: set[str] = set()
        while title in mapping and title not in seen:
            seen.add(title)
            title = mapping[title]
        return by_title.get(title, {})

    for cand in candidates:
        page = page_for(cand)
        if acceptable(page):
            return page["title"], page["thumbnail"]["source"]

    # 대표 이미지가 지도/휘장이어도 문서 자체는 찾은 경우 → 본문 이미지 fallback용
    resolved_title = next(
        (
            page_for(c)["title"]
            for c in candidates
            if page_for(c).get("title") and "missing" not in page_for(c)
        ),
        None,
    )

    # 검색 fallback: "부모 장소명"으로 검색, 장소명이 제목에 포함된 결과만 채택
    result = wiki_query(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"{parent} {name}",
            "gsrlimit": 5,
            "prop": "pageimages",
            "piprop": "thumbnail|name",
            "pithumbsize": size,
        }
    )
    pages = sorted(
        result.get("query", {}).get("pages", {}).values(),
        key=lambda p: p.get("index", 99),
    )
    core = re.sub(r"(시|군|구)$", "", name)  # "수원시" → "수원" 도 매칭되게
    for page in pages:
        title = page.get("title", "")
        if (name in title or (core and core in title)) and acceptable(page):
            return title, page["thumbnail"]["source"]

    if resolved_title:
        found = article_image(resolved_title, size) or wikidata_image(
            resolved_title, size
        )
        if found:
            return found

    # 최후 fallback: 영어 위키백과 대표 이미지 (EN_TITLES에 등록된 장소만)
    en_title = EN_TITLES.get((parent, name)) or EN_TITLES.get(name)
    if en_title:
        result = wiki_query(
            {
                "action": "query",
                "titles": en_title,
                "prop": "pageimages",
                "piprop": "thumbnail|name",
                "pithumbsize": size,
                "redirects": 1,
            },
            api="https://en.wikipedia.org/w/api.php",
        )
        for page in result.get("query", {}).get("pages", {}).values():
            if acceptable(page):
                return f"en:{page['title']}", page["thumbnail"]["source"]
    return None


def ext_from_url(url: str) -> str:
    base = urllib.parse.unquote(urllib.parse.urlparse(url).path.rsplit("/", 1)[-1])
    ext = Path(base).suffix.lower().lstrip(".")
    return ext if ext in {"jpg", "jpeg", "png", "webp"} else "jpg"


# ---------------------------------------------------------------- 출력 파일


def existing_image(place_id: int) -> Path | None:
    matches = list(IMAGES_DIR.glob(f"{place_id}.*"))
    return matches[0] if matches else None


def write_ts_mapping(entries: list[tuple[int, str, str]]) -> None:
    """entries: (id, 파일명, 주석용 장소명)."""
    lines = [
        "// 자동 생성 파일 — 직접 수정하지 마세요.",
        "// 재생성: python3 scripts/fetch_place_images.py",
        'import type { ImageSourcePropType } from "react-native";',
        "",
        "export const PLACE_IMAGES: Record<number, ImageSourcePropType> = {",
    ]
    for place_id, filename, label in sorted(entries):
        lines.append(
            f'  {place_id}: require("../assets/images/places/{filename}"), // {label}'
        )
    lines += ["};", ""]
    TS_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"[ts] {TS_OUT.relative_to(APP_DIR)} 생성 ({len(entries)}개 매핑)")


# ---------------------------------------------------------------- 메인


def main() -> None:
    parser = argparse.ArgumentParser(description="여행 장소 썸네일 수집")
    parser.add_argument("--force", action="store_true", help="기존 이미지도 재다운로드")
    parser.add_argument("--size", type=int, default=320, help="썸네일 가로폭(px)")
    parser.add_argument("--limit", type=int, default=0, help="앞 N개만 처리 (테스트용)")
    args = parser.parse_args()

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    places = load_places()
    by_id = {p["id"]: p for p in places}
    cities = [p for p in places if p["type"] == "CITY"]
    if args.limit:
        cities = cities[: args.limit]
    print(f"[places] CITY {len(cities)}개 대상")

    credits: dict[str, dict] = {}
    if CREDITS_OUT.exists():
        credits = json.loads(CREDITS_OUT.read_text(encoding="utf-8"))

    entries: list[tuple[int, str, str]] = []
    failed: list[str] = []

    for i, city in enumerate(cities, 1):
        place_id, name = city["id"], city["name"]
        parent = by_id.get(city["parentId"], {}).get("name", "")
        label = f"{name} ({parent})" if parent else name

        cached = existing_image(place_id)
        if cached and not args.force:
            entries.append((place_id, cached.name, label))
            continue

        try:
            found = find_thumbnail(name, parent, args.size)
            if not found:
                failed.append(label)
                print(f"  [{i}/{len(cities)}] ✗ {label}: 이미지 없음")
                continue
            title, thumb_url = found
            filename = f"{place_id}.{ext_from_url(thumb_url)}"
            (IMAGES_DIR / filename).write_bytes(http_get(thumb_url))
            entries.append((place_id, filename, label))
            credits[str(place_id)] = {
                "name": name,
                "parent": parent,
                "wikiTitle": title,
                "image": filename,
                "source": thumb_url,
            }
            if i % 25 == 0 or i == len(cities):
                print(f"  [{i}/{len(cities)}] … 진행 중 (최근: {label} ← {title})")
        except (urllib.error.URLError, TimeoutError) as e:
            failed.append(label)
            print(f"  [{i}/{len(cities)}] ✗ {label}: 요청 실패 {e}")

    CREDITS_OUT.write_text(
        json.dumps(credits, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    write_ts_mapping(entries)

    print(f"\n완료: 성공 {len(entries)} / 실패 {len(failed)}")
    if failed:
        print("이미지를 찾지 못한 장소 (MANUAL_TITLES에 위키 문서 제목을 추가하세요):")
        for label in failed:
            print(f"  - {label}")


if __name__ == "__main__":
    main()
