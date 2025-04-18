import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styles from '../assets/SearchTest.module.css'
import course1 from '/course1.jpg'
import course2 from '/course2.jpg'
import course3 from '/course3.jpg'

const SearchTest = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [sortOption, setSortOption] = useState('三 인기순')
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(8)
  const [loading, setLoading] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const suggestions = ['제주도 맛집', '제주도 관광지', '제주도 숙소', '제주도 카페', '제주도 해변']

  const categories = ['전체', '관광지', '문화시설', '행사/공연/축제', '여행코스', '레포츠', '숙박', '쇼핑', '음식점']

  const sortOptions = ['三 인기순', '三 평점순', '三 거리순', '三 최신순']

  const filterOptions = [
    { name: '지역', options: ['서울', '부산', '제주', '강원', '경기'] },
    { name: '가격대', options: ['무료', '1만원 미만', '1-3만원', '3-5만원', '5만원 이상'] },
    { name: '평점', options: ['4.5 이상', '4.0 이상', '3.5 이상', '3.0 이상'] },
  ]

  const allResults = [
    {
      id: 1,
      name: '성산일출봉',
      description: '제주도의 상징적인 자연 명소, UNESCO 세계자연유산',
      rating: 4.8,
      reviews: 1243,
      location: '제주 서귀포시 성산읍',
      category: '관광지',
      image: course1,
    },
    {
      id: 2,
      name: '제주 흑돼지 명가',
      description: '제주 흑돼지 전문점, 직화구이와 다양한 사이드 메뉴',
      rating: 4.6,
      reviews: 982,
      location: '제주시 노형동',
      category: '음식점',
      image: course2,
    },
    {
      id: 3,
      name: '한라산 국립공원',
      description: '제주도의 중심에 위치한 한라산, 다양한 등산로와 아름다운 경관',
      rating: 4.9,
      reviews: 2156,
      location: '제주 중앙',
      category: '관광지',
      image: course3,
    },
    {
      id: 4,
      name: '제주 오션 뷰 리조트',
      description: '바다가 보이는 럭셔리 리조트, 수영장과 스파 시설 완비',
      rating: 4.7,
      reviews: 876,
      location: '제주 서귀포시 중문',
      category: '숙박',
      image: course1,
    },
    {
      id: 5,
      name: '우도 해안도로',
      description: '아름다운 해안선을 따라 자전거나 전기차로 둘러볼 수 있는 코스',
      rating: 4.5,
      reviews: 765,
      location: '제주 우도',
      category: '관광지',
      image: course2,
    },
    {
      id: 6,
      name: '제주 전통 해녀의 집',
      description: '신선한 해산물과 제주 전통 음식을 맛볼 수 있는 식당',
      rating: 4.4,
      reviews: 543,
      location: '제주시 구좌읍',
      category: '음식점',
      image: course3,
    },
    {
      id: 7,
      name: '카멜리아 힐',
      description: '동양에서 가장 큰 동백 정원, 사계절 다양한 꽃을 볼 수 있음',
      rating: 4.3,
      reviews: 678,
      location: '제주 서귀포시 안덕면',
      category: '관광지',
      image: course1,
    },
    {
      id: 8,
      name: '제주 바다 카페',
      description: '탁 트인 바다 전망이 일품인 감성 카페, 수제 디저트 제공',
      rating: 4.6,
      reviews: 421,
      location: '제주 서귀포시 대정읍',
      category: '카페',
      image: course2,
    },
    {
      id: 9,
      name: '성산일출봉2',
      description: '제주도의 상징적인 자연 명소, UNESCO 세계자연유산',
      rating: 4.8,
      reviews: 1243,
      location: '제주 서귀포시 성산읍',
      category: '관광지',
      image: course1,
    },
    {
      id: 10,
      name: '제주 흑돼지 명가2',
      description: '제주 흑돼지 전문점, 직화구이와 다양한 사이드 메뉴',
      rating: 4.6,
      reviews: 982,
      location: '제주시 노형동',
      category: '음식점',
      image: course2,
    },
    {
      id: 11,
      name: '한라산 국립공원2',
      description: '제주도의 중심에 위치한 한라산, 다양한 등산로와 아름다운 경관',
      rating: 4.9,
      reviews: 2156,
      location: '제주 중앙',
      category: '관광지',
      image: course3,
    },
    {
      id: 12,
      name: '제주 오션 뷰 리조트2',
      description: '바다가 보이는 럭셔리 리조트, 수영장과 스파 시설 완비',
      rating: 4.7,
      reviews: 876,
      location: '제주 서귀포시 중문',
      category: '숙박',
      image: course1,
    },
    {
      id: 13,
      name: '우도 해안도로2',
      description: '아름다운 해안선을 따라 자전거나 전기차로 둘러볼 수 있는 코스',
      rating: 4.5,
      reviews: 765,
      location: '제주 우도',
      category: '관광지',
      image: course2,
    },
    {
      id: 14,
      name: '제주 전통 해녀의 집2',
      description: '신선한 해산물과 제주 전통 음식을 맛볼 수 있는 식당',
      rating: 4.4,
      reviews: 543,
      location: '제주시 구좌읍',
      category: '음식점',
      image: course3,
    },
    {
      id: 15,
      name: '카멜리아 힐2',
      description: '동양에서 가장 큰 동백 정원, 사계절 다양한 꽃을 볼 수 있음',
      rating: 4.3,
      reviews: 678,
      location: '제주 서귀포시 안덕면',
      category: '관광지',
      image: course1,
    },
    {
      id: 16,
      name: '제주 바다 카페2',
      description: '탁 트인 바다 전망이 일품인 감성 카페, 수제 디저트 제공',
      rating: 4.6,
      reviews: 421,
      location: '제주 서귀포시 대정읍',
      category: '카페',
      image: course2,
    },
    {
      id: 17,
      name: '성산일출봉3',
      description: '제주도의 상징적인 자연 명소, UNESCO 세계자연유산',
      rating: 4.8,
      reviews: 1243,
      location: '제주 서귀포시 성산읍',
      category: '관광지',
      image: course1,
    },
    {
      id: 18,
      name: '제주 흑돼지 명가3',
      description: '제주 흑돼지 전문점, 직화구이와 다양한 사이드 메뉴',
      rating: 4.6,
      reviews: 982,
      location: '제주시 노형동',
      category: '음식점',
      image: course2,
    },
    {
      id: 19,
      name: '한라산 국립공원3',
      description: '제주도의 중심에 위치한 한라산, 다양한 등산로와 아름다운 경관',
      rating: 4.9,
      reviews: 2156,
      location: '제주 중앙',
      category: '관광지',
      image: course3,
    },
    {
      id: 20,
      name: '제주 오션 뷰 리조트3',
      description: '바다가 보이는 럭셔리 리조트, 수영장과 스파 시설 완비',
      rating: 4.7,
      reviews: 876,
      location: '제주 서귀포시 중문',
      category: '숙박',
      image: course1,
    },
    {
      id: 21,
      name: '우도 해안도로3',
      description: '아름다운 해안선을 따라 자전거나 전기차로 둘러볼 수 있는 코스',
      rating: 4.5,
      reviews: 765,
      location: '제주 우도',
      category: '관광지',
      image: course2,
    },
    {
      id: 22,
      name: '제주 전통 해녀의 집3',
      description: '신선한 해산물과 제주 전통 음식을 맛볼 수 있는 식당',
      rating: 4.4,
      reviews: 543,
      location: '제주시 구좌읍',
      category: '음식점',
      image: course3,
    },
    {
      id: 23,
      name: '카멜리아 힐3',
      description: '동양에서 가장 큰 동백 정원, 사계절 다양한 꽃을 볼 수 있음',
      rating: 4.3,
      reviews: 678,
      location: '제주 서귀포시 안덕면',
      category: '관광지',
      image: course1,
    },
    {
      id: 24,
      name: '제주 바다 카페3',
      description: '탁 트인 바다 전망이 일품인 감성 카페, 수제 디저트 제공',
      rating: 4.6,
      reviews: 421,
      location: '제주 서귀포시 대정읍',
      category: '카페',
      image: course2,
    },
  ]

  // URL 쿼리 파라미터에서 검색어 읽기
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get('q') || ''
    setSearchTerm(query)
  }, [location.search])

  const getPaginatedResults = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return allResults.slice(startIndex, endIndex)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleFilter = (filterItem: string) => {
    if (selectedFilters.includes(filterItem)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filterItem))
    } else {
      setSelectedFilters([...selectedFilters, filterItem])
    }
  }

  const totalPages = Math.ceil(allResults.length / pageSize)

  const renderPagination = () => {
    const pageNumbers: number[] = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className={styles.pagination}>
        {/* 맨 앞 버튼 */}
        <button className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          &lt;&lt;
        </button>
        {/* 이전 버튼 */}
        <button className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          &lt;
        </button>
        {/* 페이지 번호 버튼 */}
        {pageNumbers.map((page) => (
          <button key={page} className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`} onClick={() => setCurrentPage(page)}>
            {page}
          </button>
        ))}
        {/* 다음 버튼 */}
        <button
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={() => {
            setLoading(true)
            setTimeout(() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              setLoading(false)
            }, 1000)
          }}
          disabled={currentPage === totalPages}>
          &gt;
        </button>
        {/* 맨 끝 버튼 */}
        <button className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          &gt;&gt;
        </button>
      </div>
    )
  }

  return (
    <div className={styles.appContainer}>
      {/* 헤더 */}
      <header className={styles.appHeader}>
        <div className={styles.headerContainer}>
          <button className={styles.backButton}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <i className="fas fa-sliders-h"></i>
          </button>
        </div>
      </header>

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        {/* 검색창 */}
        <div className={styles.searchBarWrapper} ref={searchRef}>
          <div className={styles.searchBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="지역, 음식, 장소 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            <button className={styles.searchBtn1}>검색</button>
            <button className={styles.searchIcon}>
              <i className="fas fa-search"></i>
            </button>
          </div>

          {showSuggestions && (
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => {
                    setSearchTerm(suggestion)
                    setShowSuggestions(false)
                  }}>
                  <i className={`fas fa-history ${styles.suggestionIcon}`}></i>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <button key={category} className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`} onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 확장 필터 */}
        {showFilters && (
          <div className={styles.extendedFilters}>
            {filterOptions.map((filterGroup) => (
              <div key={filterGroup.name} className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>{filterGroup.name}</h3>
                <div className={styles.filterOptions}>
                  {filterGroup.options.map((option) => (
                    <button key={option} className={`${styles.filterOption} ${selectedFilters.includes(option) ? styles.selected : ''}`} onClick={() => toggleFilter(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 정렬 옵션 */}
        <div className={styles.sortSection}>
          <p className={styles.resultsCount}>
            <span className={styles.resultsNumber}>{allResults.length}</span>개의 검색결과
          </p>

          <div className={styles.sortDropdownWrapper} ref={sortRef}>
            <button className={styles.sortButton} onClick={() => setShowSortOptions(!showSortOptions)}>
              <span>{sortOption}</span>
              <i className={`fas fa-chevron-down ${styles.sortIcon} ${showSortOptions ? styles.rotate : ''}`}></i>
            </button>

            {showSortOptions && (
              <div className={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <div
                    key={option}
                    className={styles.sortOption}
                    onClick={() => {
                      setSortOption(option)
                      setShowSortOptions(false)
                    }}>
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 검색결과 컨텐츠 영역 */}
      <div className={styles.resultsContainer}>
        {getPaginatedResults().length > 0 ? (
          <div className={styles.resultsGrid}>
            {getPaginatedResults().map((result) => (
              <div key={result.id} className={styles.resultCard}>
                <div className={styles.resultImageWrapper}>
                  <img src={result.image} alt={result.name} className={styles.resultImage} />
                  <button className={styles.favoriteButton}>
                    <i className="far fa-heart"></i>
                  </button>
                  <div className={styles.categoryLabelWrapper}>
                    <span className={styles.categoryLabel}>{result.category}</span>
                  </div>
                </div>
                <div className={styles.resultContent}>
                  <h3 className={styles.resultTitle}>{result.name}</h3>
                  <p className={styles.resultDescription}>{result.description}</p>
                  <div className={styles.resultRating}>
                    <div className={styles.starIcon}>
                      <i className="fas fa-star"></i>
                    </div>
                    <span className={styles.ratingValue}>{result.rating}</span>
                    <span className={styles.reviewCount}>({result.reviews})</span>
                  </div>
                  <div className={styles.resultLocation}>
                    <i className={`fas fa-map-marker-alt ${styles.locationIcon}`}></i>
                    <span>{result.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>
              <i className="far fa-frown"></i>
            </div>
            <h3 className={styles.noResultsTitle}>검색 결과가 없습니다</h3>
            <p className={styles.noResultsMessage}>다른 검색어를 입력하거나 필터를 조정해 보세요</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && renderPagination()}

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchTest
