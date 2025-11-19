import { useEffect, useState } from 'react'
import api from '../api'

export default function useFetch(url, params = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    api
      .get(url, { params })
      .then(res => {
        if (isMounted) {
          setData(res.data)
          setError(null)
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load data')
          setData([])
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [url, JSON.stringify(params)])

  return { data, loading, error }
}
