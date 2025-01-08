import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'//for changing location
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

function Category() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const [lastFetchedListing, setLastFetchedListing] = useState(null)
    useEffect(()=>{
        const fetchListings= async()=>{
            try{
                const listingsRef = collection(db, 'listings')//getting reference from collection 'listings'

                //create query
                const q = query(
                    listingsRef,
                    where('type', '==', params.categoryName),//params.categoryName since link format:'/category/:categoryName'
                    orderBy('timestamp', 'desc'),
                    limit(10)
                  )
                
                  const querySnap = await getDocs(q)

                  const lastVisible = querySnap.docs[querySnap.docs.length - 1]//get the last fetched listing in quersnap
                  setLastFetchedListing(lastVisible)

                  const listings=[]

                  querySnap.forEach((doc)=>{
                    return listings.push({
                        id:doc.id,
                        data:doc.data()
                    }

                    )
                  })
                  setListings(listings)
                  setLoading(false)
            }
            catch(error)
            {
                toast.error('could not fetch listing')
            }
        }
        fetchListings()
    },[params.categoryName])

    const onFetchMoreListings = async () => {
      try {
        // Get reference
        const listingsRef = collection(db, 'listings')
  
        // Create a query
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          startAfter(lastFetchedListing),
          limit(10)
        )
  
        // Execute query
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
        <p className='pageHeader'>
          {params.categoryName === 'rent'
            ? 'Places for rent'
            : 'Places for sale'}
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem listing={listing.data} id={listing.id} key={listing.id} />//each listing has a id and data which contains all the fieds
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
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category