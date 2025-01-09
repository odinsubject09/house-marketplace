import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, updateProfile, updateEmail } from 'firebase/auth'
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ListingItem from '../components/ListingItem'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)

  const getPhoneNumber=async()=>{
    const userId = auth.currentUser.uid;
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();
    return (userData.phone)
  }
  
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    phone: '', 
  })


  useEffect(() => {
    // Fetch phone number asynchronously and update state
    const fetchPhoneNumber = async () => {
      const phone = await getPhoneNumber();
      setFormData((prevState) => ({
        ...prevState,
        phone, // Update phone field with resolved value
      }));
    };

    fetchPhoneNumber();
  }, []);

  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings')

      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      )

      const querySnap = await getDocs(q)
      
      let listings = []

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings(listings)
      setLoading(false)
    }
    
    fetchUserListings()
  }, [auth.currentUser.uid])

  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const { name, email, phone } = formData

  const onSubmit = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      const updates = {}

      if (auth.currentUser.displayName !== name) {
        // Update display name in Firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        })
        updates.name = name
      }

      if (auth.currentUser.email !== email) {
        // Update email in Firebase Auth
        await updateEmail(auth.currentUser, email)
        updates.email = email
      }

      // Check if phone number has changed
      if (auth.currentUser.phoneNumber !== phone) {
        updates.phone = phone
      }

      // If there are any updates, update Firestore
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      toast.error('Could not update profile details')
    }
  }

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      await deleteDoc(doc(db, 'listings', listingId))
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      )
      setListings(updatedListings)
      toast.success('Successfully deleted listing')
    }
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit()
              setChangeDetails((prevState) => !prevState)
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type='email'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
            <input
              type='tel'
              id='phone'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={phone}
              onChange={onChange}
              placeholder='Your phone number'
            />
          </form>
        </div>
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default Profile