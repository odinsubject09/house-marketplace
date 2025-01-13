import { Link } from 'react-router-dom'
import rentCategoryImage from '../assets/jpg/derek-thomson-AJ-7QpXV9U4-unsplash.jpg'
import sellCategoryImage from '../assets/jpg/chepe-nicoli-if0K7iBBDxw-unsplash.jpg'
import Slider from '../components/Slider'
function Explore() {
  return (
    <div className='explore'>
      <header>
        <p className='pageHeader'>Explore</p>
      </header>

      <main>
        <Slider />

        <p className='exploreCategoryHeading'>Categories</p>
        <div className='exploreCategories'>
          <Link to='/category/rent'>
            <img
              src={rentCategoryImage}
              alt='rent'
              className='exploreCategoryImg'
            />
            <div className='exploreCategoryName'>Cycles for rent</div>
          </Link>
          <Link to='/category/sale'>
            <img
              src={sellCategoryImage}
              alt='sell'
              className='exploreCategoryImg'
            />
            <div className='exploreCategoryName'>Cycles for sale</div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Explore