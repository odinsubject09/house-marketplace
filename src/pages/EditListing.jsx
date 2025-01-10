import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { doc, updateDoc, getDoc, serverTimestamp ,addDoc,collection} from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'
import { storage } from '../firebase.config'

function EditListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listing, setListing] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    imageUrls: [], // Changed from 'images' to 'imageUrls'
    latitude: 0,
    longitude: 0,
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    imageUrls, // Updated field
    latitude,
    longitude,
  } = formData


  const auth = getAuth()
  const navigate = useNavigate()
  const params = useParams()
  const isMounted = useRef(true)

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing')
      navigate('/')
    }
  })

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true)
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setListing(docSnap.data())
        setFormData({ ...docSnap.data(), address: docSnap.data().location })
        setLoading(false)
      } else {
        navigate('/')
        toast.error('Listing does not exist')
      }
    }

    fetchListing()
  }, [params.listingId, navigate])

  // Sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const onSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
  
      // Validation checks
      if (discountedPrice >= regularPrice) {
        setLoading(false)
        toast.error('Discounted price needs to be less than regular price')
        return
      }
  
      if (imageUrls.length > 6) {
        setLoading(false)
        toast.error('Max 6 images')
        return
      }
  
      if (!imageUrls.length) {
        setLoading(false)
        toast.error('Please upload at least one image')
        return
      }
  
      // Handle geolocation
      let geolocation = {}
      let location
  
      if (geolocationEnabled) {
        // Add your geolocation logic here if needed
      } else {
        geolocation.lat = latitude
        geolocation.lng = longitude
        location = address
      }
  
      // Store images in Firebase
      const storeImage = async (image) => {
        console.log('Current user:', auth.currentUser?.uid)
        console.log('Image type:', image.type)
        console.log('Image size:', image.size / (1024 * 1024), 'MB')
        console.log('Uploading image:', image);
        const fileName = `${auth.currentUser?.uid}-${image.name}-${uuidv4()}`;
        console.log('Generated file name:', fileName);
      
        const storageRef = ref(storage, 'imageUrls/' + fileName);
        console.log('Storage reference:', storageRef);
      
        return new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, image);
      
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              console.log('Upload progress:', snapshot.bytesTransferred / snapshot.totalBytes);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Download URL:', downloadURL);
                resolve(downloadURL);
              } catch (error) {
                console.error('Error getting download URL:', error);
                reject(error);
              }
            }
          );
        });
      };
        
      // Upload all images and get their URLs
      const imgUrls = await Promise.all(
        Array.from(imageUrls).map((image) => storeImage(image))
      )
  
      if (!imgUrls || imgUrls.length === 0) {
        throw new Error('Failed to upload images')
      }
  
      // Prepare the listing data
      const formDataCopy = {
        ...formData,
        imgUrls,
        geolocation,
        timestamp: serverTimestamp(),
      }
  
      // Clean up the form data
      delete formDataCopy.imageUrls
      delete formDataCopy.address
      
      if (location) formDataCopy.location = location
      if (!formDataCopy.offer) delete formDataCopy.discountedPrice
  
      // Save to Firestore
      const docRef = doc(db, 'listings', params.listingId)
      await updateDoc(docRef, formDataCopy)
      setLoading(false)
      toast.success('Listing saved')
      navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  
    } catch (error) {
      console.error('Submission error:', error)
      setLoading(false)
      toast.error('Error creating listing: ' + error.message)
    }
  }
    const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }

    // Files
    if (e.target.files) {
      // Convert FileList to an array
      const newFiles = [...e.target.files];
      setFormData((prevState) => ({
        ...prevState,
        imageUrls: [...(prevState.imageUrls || []), ...newFiles],// Assign a true array
      }));
      setUploadedCount((prevCount) => prevCount + newFiles.length);
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <input
            className='formInputFile'
            type='file'
            id='imageUrls' // Updated from 'images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <p className="uploadedCount">Uploaded {uploadedCount} image(s)</p>
          <button type='submit' className='primaryButton createListingButton'>
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditListing