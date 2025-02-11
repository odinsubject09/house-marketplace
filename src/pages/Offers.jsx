import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('timestamp') // Add sort state
  const [sortOrder, setSortOrder] = useState('desc') // Add sort order state
  const [lastFetchedListing, setLastFetchedListing] = useState(null)
  const params = useParams()

  const handleSortChange = (e) => {
    const value = e.target.value
    if (value === 'newest') {
        setSortBy('timestamp')
        setSortOrder('desc')
    } else if (value === 'oldest') {
        setSortBy('timestamp')
        setSortOrder('asc')
    } else if (value === 'price-asc') {
        setSortBy('regularPrice')
        setSortOrder('desc')
    } else if (value === 'price-desc') {
        setSortBy('regularPrice')
        setSortOrder('asc')
    }
    
    // Refetch listings with new sort
    fetchListings()
}

const fetchListings = async () => {
    try {
        const listingsRef = collection(db, 'listings')

        //create query
        const q = query(
            listingsRef,
            where('offer', '==', true),
            orderBy(sortBy, sortOrder),
            limit(10)
        )
        
        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        const listings = []

        querySnap.forEach((doc) => {
            return listings.push({
                id: doc.id,
                data: doc.data()
            })
        })
        setListings(listings)
        setLoading(false)
    } catch(error) {
      console.log(error)
        toast.error('Could not fetch listings')
    }
}

useEffect(() => {
    fetchListings()
}, [params.categoryName, sortBy, sortOrder,fetchListings])

const onFetchMoreListings = async () => {
    try {
        const listingsRef = collection(db, 'listings')

        const q = query(
            listingsRef,
            where('type', '==', params.categoryName),
            orderBy(sortBy, sortOrder),
            startAfter(lastFetchedListing),
            limit(10)
        )

        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        const listings = []

        querySnap.forEach((doc) => {
            return listings.push({
                id: doc.id,
                data: doc.data(),
            })
        })

        setListings((prevState) => [...prevState, ...listings])
        setLoading(false)
    } catch (error) {
        toast.error('Could not fetch listings')
    }
}
return (
    <div className='category'>
      <header>
        <p className='pageHeader'>Offers</p>
      </header>
      <div className="sorting-container mb-4">
                <select 
                    className="sortStyles"
                    onChange={handleSortChange}
                    defaultValue="newest"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  )
}

export default Offers