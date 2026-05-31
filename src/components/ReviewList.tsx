export default function ReviewList({
    reviews
}: {
    reviews: any[]
}) {

    return (

        <div>

            {reviews.map(
                (review, index) => (

                    <div key={index}>

                        <h3>
                            {review.title}
                        </h3>

                        <p>
                            Taste:
                            {review.taste}
                        </p>

                        <p>
                            Value:
                            {review.value}
                        </p>

                        <p>
                            Ambiance:
                            {review.ambiance}
                        </p>

                        {review.verified &&
                            <p>
                                ✅ Certified
                                Authentic
                            </p>
                        }

                    </div>
                )
            )}

        </div>
    )
}