import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper'; // Import required modules
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import Spinner from './Spinner';
function Slider() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)

  const navigate = useNavigate()//to navigate to that particular listing page when that listing is clicked

  useEffect(()=>{
    const fetchListings=async()=>{
      const listingsRef = collection(db, 'listings')
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))//top 5 latest
      const querySnap = await getDocs(q)
      let listings = []

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })
      console.log(listings)
      setListings(listings)
      setLoading(false)
    }
    fetchListings()
    },[])

    if (loading) {
      return <Spinner />
    }
    if(listings.length===0)
    {
      return <></>
    }
    return (listings&&(
      <>
          <p className='exploreHeading'>Recommended</p>

          <Swiper modules={[Autoplay, Navigation, Pagination, Scrollbar]}
          slidesPerView={1} 
          pagination={{ clickable: true }}
          autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}>
            {listings.map(({data,id})=>(
              <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
              >
                <div
                className='swiperSlideDiv'
              >
                <img
      src={data.imgUrls[0]}
      alt={`Slide show}`}
      className="swiperSlideImg"
    />
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlidePrice'>
                &#x20b9;{data.discountedPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/ month'}
                </p>
              </div>
              </SwiperSlide>
            ))}
          </Swiper>
      </>
    )
  )
  
}

export default Slider