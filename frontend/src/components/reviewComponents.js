import "../styles/reviewComponents.css"

const Review = ({text, rating, full}) => {
  const Card = () => {
    return(
      <div className="review">
        <h4>{rating+"/10"}</h4>
        <p>{text}</p>
      </div>
    )
  }
  const Full = () => {
    return(
      <div className="review">
        <p>{text}</p>
        <h4>{rating+"/10"}</h4>
      </div>
    )
  }

  return(
    (!full) ? <Card /> : <Full />
  )
}

export { Review }