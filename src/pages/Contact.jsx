import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

function Contact() {
  const [message, setMessage] = useState('')
  const [landlord, setLandlord] = useState(null)
  const [searchParams] = useSearchParams()

  const params = useParams()
  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, 'users', params.landlordId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setLandlord(docSnap.data())
        console.log(docSnap.data())
      } else {
        toast.error('Could not get landlord data')
      }
    }
    getLandlord()
  }, [params.landlordId])

  const onChange = (e) => setMessage(e.target.value)

  const handleChatRoom = () => {
    if (landlord?.name) {
      const roomName = landlord.name.toLowerCase().replace(/\s+/g, '-');
      const chatServerUrl = process.env.REACT_APP_CHAT_SERVER_URL || 'http://localhost:8000';
      window.open(`${chatServerUrl}/${roomName}`, '_blank');
    } else {
      toast.error('Could not join chat room - landlord name not available');
    }
  }
  
  const handleCallClick = () => {
    const formattedPhone = landlord.phone?.replace(/\D/g, '')
    window.location.href = `tel:${formattedPhone}`
  }

  const handleWhatsAppClick = () => {
    const formattedPhone = landlord.phone?.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
      `${searchParams.get('listingName')}: ${message}`
    )}`
    window.open(whatsappUrl, '_blank')
  }
  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Contact Owner</p>
      </header>

      {landlord !== null && (
        <main>
          <div>
          <button
                    type='button'
                    onClick={handleChatRoom}
                    className='primaryButton'
          >
                    Join {landlord?.name}'s Chat Room
          </button>
          </div>
          <div className='contactLandlord'>
            <p className='landlordName'>Contact {landlord?.name}</p>
          </div>

          <form className='messageForm'>
            <div className='messageDiv'>
              <label htmlFor='message' className='messageLabel'>
                Message
              </label>
              <textarea
                name='message'
                id='message'
                className='textarea'
                value={message}
                onChange={onChange}
              ></textarea>
            </div>
            <div className='flex flex-wrap gap-8'>
              <a
                href={`mailto:${landlord.email}?Subject=${searchParams.get(
                  'listingName'
                )}&body=${message}`}
              >
                <button type='button' className='primaryButton'>
                  Send Email
                </button>
              </a>
              {landlord.phone && (
                <>
                  <button
                    type='button'
                    onClick={handleWhatsAppClick}
                    className='primaryButton'
                  >
                    Send WhatsApp
                  </button>
                  <button
                    type='button'
                    onClick={handleCallClick}
                    className='primaryButton'
                  >
                    Call Now
                  </button>
                </>
              )}
            </div>
          </form>
        </main>
      )}
    </div>
  )
}

export default Contact