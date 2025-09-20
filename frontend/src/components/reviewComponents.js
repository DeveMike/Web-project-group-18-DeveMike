import "../styles/reviewComponents.css"

const Review = ({text}) => {
  return(
    <div className="review">
      <p>{text}</p>
    </div>
  )
}

export { Review }