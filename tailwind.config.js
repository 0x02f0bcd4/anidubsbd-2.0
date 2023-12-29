/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.js","./components/**/*.js"],
  theme: {
    extend: { 
      spacing:{
        '98vw': '98dvw',
        '8vh': '8dvh',
        '30pc': '30%',
        '12%': '12%'
      },
      aspectRatio:{
        '2/1': '2/1'
      },
      colors:{
        'regal-blue': '#cafefe'
      }
    },
    fontFamily:{
      body: ["Tiro Bangla", "Noto Sans Bengali"]
    },
    dropShadow:{
      'customBanner': '0.08rem 0.08rem rgb(34 211 238)',
      'customBannerSlate': "0.10rem 0.10rem rgb(148 163 184)"
    },
    boxShadow:{
      'customBSBanner': '0.25rem 0.25rem 0.10rem rgb(34 211 238)'
    }
  },
  plugins: [
    function ({addUtilities}){
      const newUtility = {
        ".no_scrollbar::-webkit-scrollbar":{
          "display": "none"
        },
        ".no_scrollbar":{
          "-ms-overflow-style": "none",
          "scrollbar-width": "none"
        }
      };
      addUtilities(newUtility);
    },
  ],
}

