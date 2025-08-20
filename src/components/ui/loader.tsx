
/**= () => {
    return (
        <div className="w-full flex items-center justify-center p-4 animate-pulse">
            <div className='mx-auto'>
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-primary border-t-transparent animate-spin animation-delay-200"></div>
                </div>
            </div>
        </div>
    )
} */

const LinearLoader = () => {
    return (
      <div className="container h-2 bg-orange-100/20 overflow-hidden  relative">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-orange-500/40 via-orange-600 to-orange-500/40 blur-sm opacity-30" />
        <div className="h-full w-1/4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 animate-[slide_1.8s_ease-in-out_infinite]" />
        <style>{`
          @keyframes slide {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(200%);
            }
          }
        `}</style>
      </div>
    );
  };
const Loader = LinearLoader; 
  

export { LinearLoader }

export default Loader