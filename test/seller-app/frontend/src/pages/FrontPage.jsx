import React from 'react';
import { Architecture, Security, Api, ShoppingCart } from '@mui/icons-material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FrontPage = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: true,
    adaptiveHeight: true,
    className: "center",
    centerMode: true,
    centerPadding: "0px"
  };

  const diagrams = [
    {
      image: 'diagram.png',
      title: "System Architecture",
      description: "ONDC-WooCommerce Integration Architecture"
    },
    {
      image: 'diagram.png',
      title: "Data Flow",
      description: "Request-Response Flow Between Components"
    }
  ];

  const codeExamples = [
    {
      title: "Authorization & Verification",
      subtitle: "protocol-handler.js",
      description: "Implements ONDC's authentication with Ed25519 signatures",
      icon: <Security />,
      image: 'diagram.png'
    },
    {
      title: "API Contract Implementation",
      subtitle: "catalog-service.js",
      description: "Handles catalog integration and ONDC compliance",
      icon: <Api />,
      image: 'diagram.png'
    }
  ];

  return (
    <div className="container mx-auto px-4 animate-fade-in bg-gray-50">
      <div className="text-center my-8">
        <h2 className="text-4xl font-bold mb-4 transition-all duration-300 ease-in-out text-gray-800">
          WooCommerce ONDC Adapter
        </h2>
        <p className="text-lg text-gray-600 transition-all duration-300 ease-in-out">
          Seamlessly connect your WooCommerce store to ONDC Network
        </p>
      </div>

      {/* Architecture Carousel */}
      <div className="bg-white shadow-md rounded-lg p-8 my-8 transition-all duration-300 ease-in-out">
        <h3 className="text-2xl font-semibold mb-8 flex items-center text-gray-800">
          <Architecture className="mr-2 text-blue-500" /> System Overview
        </h3>
        <div className="max-w-4xl mx-auto">
          <Slider {...sliderSettings}>
            {diagrams.map((item, index) => (
              <div key={index} className="px-4 focus:outline-none">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full max-h-[400px] object-contain mb-6 rounded-lg"
                  />
                  <h4 className="text-xl font-semibold text-center text-gray-800 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-center text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Code Examples */}
      <div className="my-12">
        <h3 className="text-2xl font-semibold mb-8 flex items-center text-gray-800">
          <ShoppingCart className="mr-2 text-blue-500" /> Implementation Details
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {codeExamples.map((example, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl text-black"
            >
              <div className="p-8">
                <div className="bg-blue-500 text-white rounded-full p-4 inline-block mb-6 shadow-md">
                  {example.icon}
                </div>
                <h4 className="text-2xl font-semibold mb-3 text-gray-800">
                  {example.title}
                </h4>
                <p className="text-blue-500 text-sm font-medium mb-3">
                  {example.subtitle}
                </p>
                <p className="text-gray-600 mb-6">
                  {example.description}
                </p>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={example.image}
                    alt={example.title}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FrontPage;