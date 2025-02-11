import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { 
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit
  } from 'firebase/firestore';
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Category() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState('timestamp')
    const [sortOrder, setSortOrder] = useState('desc')
    const params = useParams()
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const fetchListings = useCallback(async () => {
        try {
            const listingsRef = collection(db, 'listings')

            // Create query
            const q = query(
                listingsRef,
                where('type', '==', params.categoryName),
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
                    data: doc.data(),
                })
            })
            setListings(listings)
            setLoading(false)
        } catch (error) {
            toast.error('Could not fetch listings')
        }
    }, [params.categoryName, sortBy, sortOrder]) // Include dependencies

    useEffect(() => {
        fetchListings()
    }, [fetchListings])

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
            setSortOrder('asc')
        } else if (value === 'price-desc') {
            setSortBy('regularPrice')
            setSortOrder('desc')
        }
    }

    return (
        <div className='category'>
            <header>
                <p className='pageHeader'>
                    {params.categoryName === 'rent' ? 'Cycles for rent' : 'Cycles for sale'}
                </p>
            </header>
            
            {/* Sorting dropdown */}
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
                        <p className='loadMore' onClick={fetchListings}>
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
