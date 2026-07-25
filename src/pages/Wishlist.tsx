import { useEffect, useState } from "react";
import axios from "axios";


interface Restaurant {
    id: number;
    name: string;
    cuisine: string;
    rating: number;
    image?: string;
}


export default function Wishlist() {

    const [wishlist, setWishlist] =
        useState<Restaurant[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");



    useEffect(() => {

        fetchWishlist();

    }, []);




    async function fetchWishlist() {

        try {

            const token =
                localStorage.getItem("token");


            const res =
                await axios.get(
                    "/wishlist",
                    {
                        headers:{
                            Authorization:
                            `Bearer ${token}`
                        }
                    }
                );


            setWishlist(res.data);


        } catch(err) {

            console.error(err);

            setError(
                "Failed to load wishlist."
            );

        } finally {

            setLoading(false);

        }

    }





    async function removeWishlist(
        id:number
    ){

        try{

            const token =
                localStorage.getItem("token");


            await axios.delete(
                `/wishlist/${id}`,
                {
                    headers:{
                        Authorization:
                        `Bearer ${token}`
                    }
                }
            );


            setWishlist(
                prev =>
                prev.filter(
                    item =>
                    item.id !== id
                )
            );


        }catch(err){

            console.error(err);

            alert(
                "Failed to remove restaurant"
            );

        }

    }





    if(loading){

        return (

            <div
                style={{
                    textAlign:"center",
                    marginTop:"80px",
                    color:"#777"
                }}
            >
                Loading your wishlist...
            </div>

        );

    }





    return (

        <div

            style={{

                maxWidth:"950px",

                margin:"40px auto",

                padding:"20px",

            }}

        >



            <h1

                style={{

                    color:"#E67E22",

                    fontSize:"32px",

                    marginBottom:"8px",

                }}

            >

                ❤️ My Wishlist

            </h1>




            <p

                style={{

                    color:"#777",

                    marginBottom:"30px",

                    fontSize:"16px"

                }}

            >

                Restaurants you saved for your next dining experience.

            </p>




            {
                error &&

                <p
                    style={{
                        color:"#E74C3C"
                    }}
                >
                    {error}
                </p>
            }





            {
                wishlist.length === 0 ?

                (

                    <div

                        style={{

                            background:"#FFF8F2",

                            padding:"50px",

                            borderRadius:"18px",

                            textAlign:"center",

                        }}

                    >

                        <h2
                            style={{
                                color:"#333"
                            }}
                        >

                            Your wishlist is empty

                        </h2>


                        <p
                            style={{
                                color:"#777"
                            }}
                        >

                            Start saving restaurants you love!

                        </p>


                    </div>


                )


                :


                (

                    <div

                        style={{

                            display:"flex",

                            flexDirection:"column",

                            gap:"20px"

                        }}

                    >



                    {
                        wishlist.map(

                            restaurant =>

                            (

                            <div

                                key={
                                    restaurant.id
                                }


                                style={{

                                    display:"flex",

                                    alignItems:"center",

                                    justifyContent:
                                    "space-between",


                                    background:"#FFFFFF",

                                    borderRadius:"18px",

                                    padding:"20px",


                                    boxShadow:
                                    "0 6px 18px rgba(0,0,0,0.08)"

                                }}

                            >





                                <div

                                    style={{

                                        display:"flex",

                                        alignItems:"center",

                                        gap:"20px"

                                    }}

                                >



                                    {
                                        restaurant.image &&

                                        <img

                                            src={
                                                restaurant.image
                                            }

                                            alt={
                                                restaurant.name
                                            }

                                            style={{

                                                width:"110px",

                                                height:"110px",

                                                objectFit:
                                                "cover",

                                                borderRadius:
                                                "15px"

                                            }}

                                        />

                                    }




                                    <div>


                                        <h2

                                            style={{

                                                margin:"0 0 8px",

                                                color:"#2D3436"

                                            }}

                                        >

                                            {
                                                restaurant.name
                                            }

                                        </h2>



                                        <p

                                            style={{

                                                margin:"5px 0",

                                                color:"#666"

                                            }}

                                        >

                                            🍽️ {
                                                restaurant.cuisine
                                            }

                                        </p>




                                        <p

                                            style={{

                                                margin:"5px 0",

                                                color:"#E67E22",

                                                fontWeight:"bold"

                                            }}

                                        >

                                            ⭐ {
                                                restaurant.rating
                                            }

                                        </p>


                                    </div>



                                </div>





                                <button

                                    onClick={()=>
                                        removeWishlist(
                                            restaurant.id
                                        )
                                    }


                                    style={{

                                        background:"#E74C3C",

                                        color:"white",

                                        border:"none",

                                        padding:
                                        "12px 20px",

                                        borderRadius:
                                        "12px",

                                        cursor:"pointer",

                                        fontSize:"15px",

                                        fontWeight:
                                        "bold"

                                    }}

                                >

                                    Remove

                                </button>





                            </div>

                            )

                        )
                    }



                    </div>

                )

            }


        </div>

    );

}