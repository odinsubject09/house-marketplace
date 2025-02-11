import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'
import { storage } from '../firebase.config'

function CreateListing() {
  const [geolocationEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    description: '',
    old: 1,
    brand: '',
    parking: false,
    gear: false,
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
    description,
    old,
    brand,
    parking,
    gear,
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
  const isMounted = useRef(true)

  const [uploadedCount, setUploadedCount] = useState(0);

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

    setLoading(true)

    if (+discountedPrice >= +regularPrice) {
      console.log(discountedPrice+' '+regularPrice)
      setLoading(false)
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    if (imageUrls.length > 6) { // Updated from 'images' to 'imageUrls'
      setLoading(false)
      toast.error('Max 6 images')
      return
    }

    let geolocation = {}
    let location

    if (geolocationEnabled) {
      
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
      location = address
    }

    // Store image in firebase
    const storeImage = async (image) => {
    
      const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

      const storageRef = ref(storage, 'imageUrls/' + fileName)

      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          (snapshot) => {},
          (error) => {
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          }
        )
      })
    }

    const imgUrls = await Promise.all(
      [...imageUrls].map((image) => storeImage(image)) // Updated from 'images' to 'imageUrls'
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }
    setLoading(false)
    delete formDataCopy.imageUrls // Updated from 'images'
    delete formDataCopy.address
    location && (formDataCopy.location = location)
    !formDataCopy.offer && delete formDataCopy.discountedPrice
    console.log(formDataCopy)
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
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
        <p className='pageHeader'>Create a Listing</p>
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

          <label className='formLabel'>Brief Description</label>
          <input
            className='formInputName'
            type='text'
            id='description'
            value={description}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Old(in months)</label>
              <input
                className='formInputSmall'
                type='number'
                id='old'
                value={old}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
            <label className='formLabel'>{'\t'}&nbsp;&nbsp;&nbsp;Brand</label>
          <input
            className='formInputName'
            type='text'
            id='brand'
            value={brand}
            onChange={onMutate}
            maxLength='32'
            minLength='3'
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

          <label className='formLabel'>Gear</label>
          <div className='formButtons'>
            <button
              className={gear ? 'formButtonActive' : 'formButton'}
              type='button'
              id='gear'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !gear && gear !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='gear'
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
              <button type='button' className='secondaryButton formLabel formInputSmall'
                onClick={() => {
                const encodedAddress = encodeURIComponent(address);
                const latLongUrl = `https://www.latlong.net/?place=${encodedAddress}`;
                window.open(latLongUrl, '_blank');
                }}
              >
                Get Latitude and Longitude
              </button>
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
            {type === 'rent' && <p className='formPriceText'>&#x20b9; / Month</p>}
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
                max='750000000'
                required={offer}
              />
            </>
          )}


          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
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
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
