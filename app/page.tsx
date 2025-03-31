"use client";

import { GuestsRoomsPicker } from "@/components/guest-room-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Bed,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  MapPin,
  Search,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DateRangePicker } from "./components/DateRangePicker";
import { useAuth } from "./hooks/useAuth";
import { useAuthContext } from "./components/AuthProvider";
import Navbar from "@/components/Navbar";
import FeaturedProperties from "@/components/Home/FeaturedProperties";

export default function Home() {
  const [activeTab, setActiveTab] = useState("stays");
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <main className="min-h-screen overflow-hidden relative bg-background">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh]">
        <motion.div
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.pexels.com/photos/454880/pexels-photo-454880.jpeg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 z-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
              Find your perfect stay
            </h1>
            <p className="text-lg md:text-xl mb-8 text-center max-w-2xl">
              Search deals on hotels, homes, and much more...
            </p>
          </motion.div>

          {/* Search Tabs */}
          <motion.div
            className="w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Tabs
              defaultValue="stays"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full justify-start rounded-none bg-white border-b h-auto p-0">
                <TabsTrigger
                  value="stays"
                  className={`rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === "stays"
                      ? "border-b-2 border-blue-700 text-blue-700"
                      : "text-gray-600 border-b-2 border-white"
                  }`}
                >
                  <Bed className="mr-2 h-4 w-4" />
                  Stays
                </TabsTrigger>
                <TabsTrigger
                  value="flights"
                  className={`rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === "flights"
                      ? "border-b-2 border-blue-700 text-blue-700"
                      : "text-gray-600 border-b-2 border-white"
                  }`}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Flights
                </TabsTrigger>
                <TabsTrigger
                  value="cars"
                  className={`rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === "cars"
                      ? "border-b-2 border-blue-700 text-blue-700"
                      : "text-gray-600 border-b-2 border-white"
                  }`}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Car Rentals
                </TabsTrigger>
                <TabsTrigger
                  value="attractions"
                  className={`rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                    activeTab === "attractions"
                      ? "border-b-2 border-blue-700 text-blue-700"
                      : "text-gray-600 border-b-2 border-white"
                  }`}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Attractions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stays" className="p-0 m-0">
                {/* Search Bar */}
                <div className="bg-white text-black p-4 w-full flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px] flex items-center gap-2 border rounded-md p-2">
                    <Search className="text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Where are you going?"
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex-1 min-w-[300px] border rounded-md p-2">
                    <DateRangePicker />
                  </div>
                  <div className="flex-1 min-w-[200px] border rounded-md p-2">
                    <GuestsRoomsPicker />
                  </div>
                  <Button className="bg-blue-700 hover:bg-blue-800 min-w-[120px]">
                    Search
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="flights" className="p-0 m-0">
                <div className="bg-white text-black p-4 w-full flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px] flex items-center gap-2 border rounded-md p-2">
                    <MapPin className="text-gray-400" />
                    <Input
                      type="text"
                      placeholder="From where?"
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex-1 min-w-[250px] flex items-center gap-2 border rounded-md p-2">
                    <MapPin className="text-gray-400" />
                    <Input
                      type="text"
                      placeholder="To where?"
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] border rounded-md p-2">
                    <DateRangePicker />
                  </div>
                  <Button className="bg-blue-700 hover:bg-blue-800 min-w-[120px]">
                    Search
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cars" className="p-0 m-0">
                <div className="bg-white text-black p-4 w-full flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px] flex items-center gap-2 border rounded-md p-2">
                    <MapPin className="text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Pick-up location"
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] border rounded-md p-2">
                    <DateRangePicker />
                  </div>
                  <Button className="bg-blue-700 hover:bg-blue-800 min-w-[120px]">
                    Search
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="attractions" className="p-0 m-0">
                <div className="bg-white text-black p-4 w-full flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px] flex items-center gap-2 border rounded-md p-2">
                    <MapPin className="text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Attraction location"
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px] border rounded-md p-2">
                    <DateRangePicker />
                  </div>
                  <Button className="bg-blue-700 hover:bg-blue-800 min-w-[120px]">
                    Search
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Travel Options */}
          <motion.div
            className="flex flex-wrap gap-2 mt-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-blue-800/80 h-8 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <Input type="checkbox" className="mr-2 h-4 w-4" id="work" />
              <label htmlFor="work">I'm traveling for work</label>
            </div>
            <div className="bg-blue-800/80 h-8 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <Shield className="inline-block w-4 h-4 mr-1" />
              <div className="">COVID-19 info</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-12 bg-blue-50 px-3 md:px-10 lg:px-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Offers</h2>
            <p className="text-gray-600">
              Promotions, deals, and special offers for you
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="grid md:grid-cols-2  h-[240px]">
                  <div className="relative h-48 md:h-full">
                    <Image
                      src="https://t3.ftcdn.net/jpg/05/69/81/88/360_F_569818893_ph01fzGNwgIBf0pzcwyJ3IwsRzQTpmpN.jpg"
                      alt="Offer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Escape for a while
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Enjoy the freedom of a monthly stay on Travel.com
                      </p>
                    </div>
                    <Button className="bg-blue-700 hover:bg-blue-800 w-full md:w-auto">
                      Find monthly stays
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="grid md:grid-cols-2 h-[240px]">
                  <div className="relative h-48 md:h-full">
                    <Image
                      src="https://thumbs.dreamstime.com/b/young-group-happy-people-enjoying-time-together-city-street-vertical-shot-millennial-generation-friends-having-fun-laughing-344130089.jpg"
                      alt="Offer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Save 15% with Late Escape Deals
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Explore thousands of destinations worldwide and save 15%
                      </p>
                    </div>
                    <Button className="bg-blue-700 hover:bg-blue-800 w-full md:w-auto">
                      Find Late Escape Deals
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <FeaturedProperties/>

      {/* Travel Inspiration */}
      <section className="py-12 bg-blue-50 px-3 md:px-10 lg:px-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Get inspiration for your next trip
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {travelInspirations.map((inspiration, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48">
                    <Image
                      src={inspiration.image}
                      alt={inspiration.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {inspiration.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {inspiration.description}
                    </p>
                    <Link
                      href="#"
                      className="text-blue-700 font-medium flex items-center"
                    >
                      Read more <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-700 text-white px-3 md:px-10 lg:px-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Save time, save money!
            </h2>
            <p className="mb-6">Sign up and we'll send the best deals to you</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white text-black"
              />
              <Button className="bg-blue-900 hover:bg-blue-950">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 px-3 md:px-10 lg:px-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Safety Information
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Cancellation Options
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Support for Disabilities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Report a Concern
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Community</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Travel.com for Work
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Invite Friends
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Gift Cards
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Travel.com Associates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Hosting</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    List Your Property
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Responsible Hosting
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Host Experiences
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Resource Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Community Forum
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Newsroom
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Investors
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blue-700">
                    Trust & Safety
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>© {new Date().getFullYear()} Travel.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}



const travelInspirations = [
  {
    title: "Top 10 Beach Destinations",
    description:
      "Discover the most beautiful beaches around the world for your next vacation.",
    image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg",
  },
  {
    title: "City Breaks for Couples",
    description: "Romantic getaways in the world's most charming cities.",
    image:
      "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2021/01/14101943/New-Featured-1-3.jpg",
  },
  {
    title: "Family-Friendly Adventures",
    description: "Perfect destinations for an unforgettable family vacation.",
    image:
      "https://media.istockphoto.com/id/1049858904/photo/rear-view-of-family-standing-at-top-of-hill-on-hike-through-countryside-in-lake-district-uk.jpg?s=612x612&w=0&k=20&c=eiiL682xNhJ3q1kqlrVr-aobUeBhmSMpoS8qo3gbSPs=",
  },
];
