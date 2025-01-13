import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import cycleIcon from '../assets/svg/bicycle-solid.svg'
import gearIcon from '../assets/svg/gears-solid.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'

function ListingItem({listing,id,onEdit,onDelete}) {
    return (
        <li className='categoryListing'>
          <Link
            to={`/category/${listing.type}/${id}`}//type:rent or sale
            className='categoryListingLink'
          >
            <img
          src={listing.imgUrls[0]}
          alt={listing.name}
          className='categoryListingImg'
            />
            <div className='categoryListingDetails'>
                <p className='categoryListingLocation'>{listing.location}</p>
                <p className='categoryListingName'>{listing.description}</p>
                <p className='categoryListingPrice'>
                &#x20b9;{listing.offer? //check if offer present
                   listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')//for commas
                   :listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  {listing.type === 'rent' && ' / Month'} 
                </p>
                <div className='categoryListingInfoDiv'>
                    <img src={cycleIcon} style={{ width: '40px', height: '40px' }} alt='old' />
                    <p className='categoryListingInfoText'>
                        {listing.old > 1 ? `${listing.old} months old`
                        : '1 month old'}
                    </p>
                    <img src={gearIcon} style={{ width: '40px', height: '40px' }} alt='gear' />
                    <p className='categoryListingInfoText'>
                        {listing.gear
                        ? `Gear cycle`
                        : 'Non Gear'}
                    </p>
                </div>
            </div>
          </Link>
          {onDelete && (
        <DeleteIcon
          className='removeIcon'
          fill='rgb(231, 76,60)'
          onClick={() => onDelete(listing.id, listing.name)}
        />
      )}
      {onEdit && <EditIcon className='editIcon' onClick={() => onEdit(id)} />}
    </li>
  )
}

export default ListingItem