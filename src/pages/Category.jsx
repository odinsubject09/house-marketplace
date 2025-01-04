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
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  )
}

export default Category