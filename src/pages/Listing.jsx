import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'




// Import Swiper styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper'; // Import required modules
import 'swiper/swiper-bundle.css'; // Import Swiper styles

function Listing() {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)

  const navigate = useNavigate()
  const params = useParams()//to access the URL
  const auth = getAuth()

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setListing(docSnap.data())
        console.log(listing)
        setLoading(false)
      }
    }

    fetchListing()
  }, [navigate, params.listingId])

  if (loading) {
    return <Spinner />
  }

  return (
    <main>
    <Swiper
      modules={[Autoplay, Navigation, Pagination, Scrollbar]} // Pass modules here
      slidesPerView={1}
      navigation={true}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
    >
      {listing.imgUrls.map((url, index) => (
            
            <SwiperSlide key={index}>
              <div className="swiperSlideDiv">
    <img
      src={listing.imgUrls[index]}
      alt={`Slide ${index}`}
      className="swiperSlideImg"
    />
  </div>
            </SwiperSlide>
      ))}    
      </Swiper>      
    <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)//copies URL to clipboard
          setShareLinkCopied(true)
          setTimeout(() => {
            setShareLinkCopied(false)//makes share link false after 2 sec
          }, 2000)
        }}
      >
        <img src={shareIcon} alt='' />
      </div>
      {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}
      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name}  &#x20b9;
          <span>
  {listing.offer
    ? listing.discountedPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : listing.regularPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
  {listing.type === 'rent' && ' / Month'}
</span>
        </p>

        <p className='listingLocation'>{listing.location}</p>

        <p className='listingType'>
          For {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {/*if offer present then show discount*/}
        {listing.offer && (
          <p className='discountPrice'>
            &#x20b9;{listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}
        {listing.brand && (
          <p className='discountPrice'>
            Cycle Brand:{listing.brand}
          </p>
        )}
        <ul className='listingDetailsList'>
          <li>
            {listing.old > 1
              ? `${listing.old} months old`
              : '1 month old'}
          </li>
          <li>{listing.parking && 'Parking Spot'}</li>
          <li>
            {listing.gear?'Gear Cycle':'Non Gear'}
          </li>
        </ul>
        
        <p className='listingLocationTitle'>Parking Spot</p>

        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
                         
        {auth.currentUser?.uid !== listing.userRef /*check if the listing is not that of the user*/&& (
            <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>)
        }
       </div>
    </main>
  )
}

export default Listing