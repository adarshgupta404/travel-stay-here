"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import { getAllProperties } from "@/app/actions/property";
import { IProperty } from "@/app/models/Property";
const FeaturedProperties = () => {
  const [featuredProperties, setFeaturedProperties] = useState<IProperty[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllProperties();
      if (data.success) {
        setFeaturedProperties(data.data);
      }
    };

    fetchData(); // Call fetch function inside useEffect
  }, []);
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Stagger effect for the container
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between children animations
        delayChildren: 0.1, // Start delay for first child
      },
    },
  };
  return (
    <>
      <section className="py-12 container mx-auto px-3 md:px-10 lg:px-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Featured Properties
          </h2>
          <p className="text-gray-600">Homes that guests love</p>
        </motion.div>

        {/* Properties Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuredProperties.map((property, i) => (
            <motion.div key={property._id} variants={fadeIn}>
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 bg-gray-50 px-3 md:px-10 lg:px-24">
        <div className="container mx-auto ">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Popular Destinations
            </h2>
            <p className="text-gray-600">
              Most searched destinations by our visitors
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {popularDestinations.map((destination, i) => (
              <motion.div key={i} variants={fadeIn}>
                <DestinationCard destination={destination} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Browse by Property Type */}
      <section className="py-12 container mx-auto px-3 md:px-10 lg:px-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Browse by Property Type
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {propertyTypes.map((type, i) => (
            <motion.div key={i} variants={fadeIn}>
              <Link href="#">
                <motion.div
                  className="rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                    <p className="text-gray-600">{type.count} properties</p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};

export default FeaturedProperties;
// Property Card Component
function PropertyCard({ property }: { property: IProperty }) {
  return (
    <motion.div
      className="overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <Link href={`/property/${property.slug}`}>
        <div className="relative h-48">
          <Image
            src={property.images[0] || "/placeholder.svg"}
            alt={property.name}
            fill
            className="object-cover"
          />
          {property.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              {property.discount}% OFF
            </div>
          )}
          <motion.button
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="h-4 w-4 text-gray-500" />
          </motion.button>
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center gap-1 mb-1">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
             {property.type}
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
             {property.maxGuests} Guests / Room
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
             {property.maxRooms} Rooms
            </Badge>
            {property.rating >= 9 && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Exceptional
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg">{property.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{property.location}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="bg-blue-700 text-white px-1.5 py-0.5 text-sm rounded">
                {property.rating}
              </div>
              <span className="text-sm font-medium">
                {property.rating >= 9
                  ? "Exceptional"
                  : property.rating >= 8
                  ? "Very Good"
                  : property.rating >= 7
                  ? "Good"
                  : "Fair"}
              </span>
              <span className="text-sm text-gray-500">
                ({property.reviews})
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">From</div>
              <div className="font-bold">Rs.{property.price}</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Destination Card Component
function DestinationCard({ destination }: { destination: any }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="overflow-hidden rounded-lg">
      <Link href="#">
        <div className="relative h-32 rounded-lg overflow-hidden">
          <Image
            src={
              destination.image ||
              "https://media.istockphoto.com/id/1938106570/photo/digitally-generated-domestic-bedroom-interior.jpg?s=612x612&w=0&k=20&c=bC_YWy11iWh0ZtHJIT5ia4v9QELdl94SVqDge9XNZcc="
            }
            alt={destination.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-3 text-white">
            <h3 className="font-semibold">{destination.name}</h3>
            <p className="text-sm">{destination.properties} properties</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
// Sample Data
const featuredPropertiesData = [
  {
    id: 1,
    name: "Grand Hotel & Spa",
    slug: "grand-hotel",
    location: "New York, USA",
    type: "Hotel",
    image:
      "https://media.istockphoto.com/id/1938106570/photo/digitally-generated-domestic-bedroom-interior.jpg?s=612x612&w=0&k=20&c=bC_YWy11iWh0ZtHJIT5ia4v9QELdl94SVqDge9XNZcc=",
    price: 199,
    rating: 9.2,
    reviews: 487,
    discount: 15,
  },
  {
    id: 2,
    name: "Seaside Resort",
    slug: "seaside-resort",
    location: "Miami Beach, USA",
    type: "Resort",
    image:
      "https://media.istockphoto.com/id/1938106570/photo/digitally-generated-domestic-bedroom-interior.jpg?s=612x612&w=0&k=20&c=bC_YWy11iWh0ZtHJIT5ia4v9QELdl94SVqDge9XNZcc=",
    price: 249,
    rating: 8.7,
    reviews: 302,
  },
  {
    id: 3,
    name: "Mountain View Cabin",
    slug: "mountain-cabin",
    location: "Aspen, USA",
    type: "Cabin",
    image:
      "https://media.istockphoto.com/id/1938106570/photo/digitally-generated-domestic-bedroom-interior.jpg?s=612x612&w=0&k=20&c=bC_YWy11iWh0ZtHJIT5ia4v9QELdl94SVqDge9XNZcc=",
    price: 179,
    rating: 9.5,
    reviews: 156,
    discount: 10,
  },
  {
    id: 4,
    name: "Urban Loft Apartment",
    slug: "urban-loft",
    location: "Chicago, USA",
    type: "Apartment",
    image:
      "https://media.istockphoto.com/id/1938106570/photo/digitally-generated-domestic-bedroom-interior.jpg?s=612x612&w=0&k=20&c=bC_YWy11iWh0ZtHJIT5ia4v9QELdl94SVqDge9XNZcc=",
    price: 159,
    rating: 8.9,
    reviews: 213,
  },
];

const popularDestinations = [
  {
    name: "New York",
    properties: 1204,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
  {
    name: "Paris",
    properties: 987,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
  {
    name: "London",
    properties: 1432,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
  {
    name: "Tokyo",
    properties: 876,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
  {
    name: "Rome",
    properties: 654,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
  {
    name: "Barcelona",
    properties: 543,
    image:
      "https://media.istockphoto.com/id/1454217037/photo/statue-of-liberty-and-new-york-city-skyline-with-manhattan-financial-district-world-trade.jpg?s=612x612&w=0&k=20&c=6V54_qVlDfo59GLEdY2W8DOjLbbHTJ9y4AnJ58a3cis=",
  },
];

const propertyTypes = [
  {
    name: "Hotels",
    count: 845,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC427Ns0M6JKbwYfXhViZUa_5ATeslsiu6fTmnWUQYp1NZ0xkih_DehyHaHMNoMABtCGA&usqp=CAU",
  },
  {
    name: "Apartments",
    count: 632,
    image: "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",
  },
  {
    name: "Resorts",
    count: 254,
    image:
      "https://media.cntraveler.com/photos/53da60a46dec627b149e66f4/16:9/w_2580,c_limit/hilton-moorea-lagoon-resort-spa-moorea-french-poly--110160-1.jpg",
  },
  {
    name: "Villas",
    count: 187,
    image:
      "https://media.istockphoto.com/id/506903162/photo/luxurious-villa-with-pool.jpg?s=612x612&w=0&k=20&c=Ek2P0DQ9nHQero4m9mdDyCVMVq3TLnXigxNPcZbgX2E=",
  },
];
