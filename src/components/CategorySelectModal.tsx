import { useEffect, useState } from 'react'

interface CategorySelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (cat1: string, cat2: string, cat3: string, label: string) => void
  selectedCat1?: string
  selectedCat2?: string
  selectedCat3?: string
  apiKey: string
}

interface CatItem {
  code: string
  name: string
}

const buildKey = (raw: string) => (raw || '').trim()
const TOUR_BASE = '/api/tour'; // 프록시 사용
// 공통 쿼리 (numOfRows 크게 해서 전부 수집)
const baseParams = (key: string) => `serviceKey=${buildKey(key)}&MobileOS=ETC&MobileApp=PlanIt&_type=json&pageNo=1&numOfRows=999&lclsSystmListYn=N`

async function fetchJSON(url: string) {
  console.log('[Category] 요청:', url)
  const res = await fetch(url)
  const text = await res.text()
  let json: any
  try {
    json = JSON.parse(text)
  } catch {
    console.error('[Category] JSON 파싱 실패 raw:', text)
    throw new Error('INVALID_JSON')
  }
  const header = json?.response?.header
  console.log('[Category] header:', header)
  if (header?.resultCode !== '0000') {
    throw new Error(header?.resultMsg || 'API_ERROR')
  }
  return json
}

function extractCodeItems(json: any): CatItem[] {
  const raw = json?.response?.body?.items?.item
  if (!raw) return []
  const arr: any[] = Array.isArray(raw) ? raw : [raw]
  return arr
    .map((i) => ({
      code: i.code,
      name: i.name,
    }))
    .filter((it) => it.code && it.name)
}

const CategorySelectModal: React.FC<CategorySelectModalProps> = ({ open, onClose, onSelect, selectedCat1 = '', selectedCat2 = '', selectedCat3 = '', apiKey }) => {
  const endpoint = `${TOUR_BASE}/lclsSystmCode2`

  const [cat1List, setCat1List] = useState<CatItem[]>([])
  const [cat2List, setCat2List] = useState<CatItem[]>([])
  const [cat3List, setCat3List] = useState<CatItem[]>([])

  const [cat1, setCat1] = useState(selectedCat1)
  const [cat2, setCat2] = useState(selectedCat2)
  const [cat3, setCat3] = useState(selectedCat3)

  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [loading3, setLoading3] = useState(false)
  const [err1, setErr1] = useState('')
  const [err2, setErr2] = useState('')
  const [err3, setErr3] = useState('')

  // 기존 선택값을 열 때 동기화 (취소 기능 위해)
  useEffect(() => {
    if (open) {
      setCat1(selectedCat1)
      setCat2(selectedCat2)
      setCat3(selectedCat3)
    }
  }, [open, selectedCat1, selectedCat2, selectedCat3])

  // 1Depth
  useEffect(() => {
    if (!open) return
    setErr1('')
    setLoading1(true)
    const url = `${endpoint}?${baseParams(apiKey)}&lclsSystm1=&lclsSystm2=&lclsSystm3=`
    fetchJSON(url)
      .then((j) => {
        const list = extractCodeItems(j)
        // 전체 카테고리 추가
        setCat1List([{ code: '__ALL__', name: '전체 카테고리' }, ...list])
      })
      .catch((e) => {
        console.error('[Category] 1Depth error', e)
        setErr1('대분류 로딩 실패')
        setCat1List([{ code: '__ALL__', name: '전체 카테고리' }])
      })
      .finally(() => setLoading1(false))
  }, [open, apiKey])

  // 2Depth
  useEffect(() => {
    if (!cat1 || cat1 === '__ALL__') {
      setCat2List([])
      setCat3List([])
      setCat2('')
      setCat3('')
      return
    }
    setErr2('')
    setLoading2(true)
    const url = `${endpoint}?${baseParams(apiKey)}&lclsSystm1=${encodeURIComponent(cat1)}&lclsSystm2=&lclsSystm3=`
    fetchJSON(url)
      .then((j) => {
        const items = extractCodeItems(j)
        setCat2List(items)
        setCat2('') // 상위 바뀔 때 리셋
        setCat3('')
        setCat3List([])
        if (items.length === 0) setErr2('중분류 없음')
      })
      .catch((e) => {
        console.error('[Category] 2Depth error', e)
        setErr2('중분류 로딩 실패')
        setCat2List([])
      })
      .finally(() => setLoading2(false))
  }, [cat1, apiKey])

  // 3Depth (변경 없음)
  useEffect(() => {
    if (!cat1 || !cat2) {
      setCat3List([])
      setCat3('')
      return
    }
    setErr3('')
    setLoading3(true)
    const url = `${endpoint}?${baseParams(apiKey)}&lclsSystm1=${encodeURIComponent(cat1)}&lclsSystm2=${encodeURIComponent(cat2)}&lclsSystm3=`
    fetchJSON(url)
      .then((j) => {
        const items = extractCodeItems(j)
        setCat3List(items)
        setCat3('')
        if (items.length === 0) setErr3('소분류 없음')
      })
      .catch((e) => {
        console.error('[Category] 3Depth error', e)
        setErr3('소분류 로딩 실패')
        setCat3List([])
      })
      .finally(() => setLoading3(false))
  }, [cat1, cat2, apiKey])

  if (!open) return null

  const confirm = () => {
    if (cat1 === '__ALL__') {
      onSelect('', '', '', '전체 카테고리')
      onClose()
      return
    }
    const l1 = cat1List.find((c) => c.code === cat1)?.name || ''
    const l2 = cat2List.find((c) => c.code === cat2)?.name || ''
    const l3 = cat3List.find((c) => c.code === cat3)?.name || ''
    const label = [l1, l2, l3].filter(Boolean).join(' > ')
    onSelect(cat1, cat2, cat3, label)
    onClose()
  }

  const cancel = () => {
    // 부모 값으로 복구 (동기화 useEffect 로 이미 유지되므로 그냥 닫기)
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <span>카테고리 선택</span>
          <button style={closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <div style={bodyWrap}>
          <div style={colStyle}>
            <h4 style={titleStyle}>대분류</h4>
            <div style={listStyle}>
              {loading1 && <div style={loadingStyle}>불러오는 중...</div>}
              {err1 && <div style={errStyle}>{err1}</div>}
              {!loading1 &&
                !err1 &&
                cat1List.map((c) => (
                  <button key={c.code} style={btnStyle(cat1 === c.code)} onClick={() => setCat1(cat1 === c.code ? '' : c.code)}>
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
          <div style={colStyle}>
            <h4 style={titleStyle}>중분류</h4>
            <div style={listStyle}>
              {!cat1 && <div style={hintStyle}>대분류 선택</div>}
              {loading2 && <div style={loadingStyle}>로딩...</div>}
              {err2 && <div style={errStyle}>{err2}</div>}
              {!loading2 &&
                !err2 &&
                cat2List.map((c) => (
                  <button key={c.code} style={btnStyle(cat2 === c.code)} onClick={() => setCat2(cat2 === c.code ? '' : c.code)}>
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
          <div style={colStyle}>
            <h4 style={titleStyle}>소분류</h4>
            <div style={listStyle}>
              {(!cat1 || !cat2) && <div style={hintStyle}>중분류 선택</div>}
              {loading3 && <div style={loadingStyle}>로딩...</div>}
              {err3 && <div style={errStyle}>{err3}</div>}
              {!loading3 &&
                !err3 &&
                cat3List.map((c) => (
                  <button key={c.code} style={btnStyle(cat3 === c.code)} onClick={() => setCat3(cat3 === c.code ? '' : c.code)}>
                    {c.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
        <div style={footerStyle}>
          <button onClick={confirm} style={confirmBtn} disabled={cat1 !== '__ALL__' && !cat1 && !cat2 && !cat3}>
            적용
          </button>
          <button onClick={cancel} style={cancelBtn}>
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategorySelectModal

// 스타일 동일
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }
const modalStyle: React.CSSProperties = {
  background: '#fff',
  width: '900px',
  maxWidth: '95vw',
  borderRadius: '14px',
  padding: '24px',
  boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  maxHeight: '90vh',
  overflow: 'hidden',
}
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 600 }
const closeBtn: React.CSSProperties = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }
const bodyWrap: React.CSSProperties = { display: 'flex', gap: '18px', flex: 1, overflow: 'hidden' }
const colStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }
const titleStyle: React.CSSProperties = { margin: 0, fontSize: '0.95rem', fontWeight: 600 }
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }
const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  textAlign: 'left',
  borderRadius: '10px',
  border: active ? '2px solid #2563eb' : '1px solid #d1d5db',
  background: active ? '#2563eb' : '#f3f4f6',
  color: active ? '#fff' : '#374151',
  cursor: 'pointer',
  fontWeight: active ? 600 : 500,
  fontSize: '0.85rem',
  transition: '0.15s',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px' }
const cancelBtn: React.CSSProperties = { background: '#eee', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer' }
const confirmBtn: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }
const loadingStyle: React.CSSProperties = { fontSize: '0.8rem', color: '#2563eb' }
const errStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#dc2626' }
const hintStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#888' }
