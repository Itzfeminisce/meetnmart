const Loader = () => {
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
}

export default Loader