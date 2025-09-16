import { useState } from 'react'
import Search, { getMovieId } from '../../components/Search'
import './WriteReview.css'

const WriteReview = () => {
  const [id, setId] = useState(-1)

  return(
    <div className="container">
      <h1>Valitse elokuva, josta haluat kirjoittaa arvostelun</h1>
      <Search/>
    </div>
  )
}

const Writer = (props) => {
  <h1>{props.id}</h1>
}

export default WriteReview