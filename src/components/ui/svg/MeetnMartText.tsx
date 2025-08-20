export const MeetnMartText = ({ variant = 'default', size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
    xl: 'text-4xl'
  };

  const variants = {
    default: (
      <h1 className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        MeetnMart
      </h1>
    ),
    elegant: (
      <h1 className={`font-serif ${sizeClasses[size]} text-gray-800 tracking-wide`}>
        Meet<span className="text-blue-600 font-bold">n</span>Mart
      </h1>
    ),
    modern: (
      <h1 className={`font-bold ${sizeClasses[size]} text-gray-900`}>
        Meet<span className="text-blue-500">n</span><span className="text-green-500">Mart</span>
      </h1>
    ),
    playful: (
      <h1 className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent`}>
        Meet<span className="text-yellow-500">n</span>Mart
      </h1>
    ),
    professional: (
      <h1 className={`font-semibold ${sizeClasses[size]} text-foreground/60 tracking-widest`}>
        MeetnMart
      </h1>
    ),
    vibrant: (
      <h1 className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm`}>
        MeetnMart
      </h1>
    ),
    tech: (
      <h1 className={`font-mono font-bold ${sizeClasses[size]} text-green-600 tracking-wider`}>
        Meet<span className="text-blue-500">n</span>Mart
      </h1>
    ),
    luxury: (
      <h1 className={`font-serif font-bold ${sizeClasses[size]} text-gray-900 tracking-widest`}>
        Meet<span className="text-amber-600 italic">n</span>Mart
      </h1>
    )
  };

  return (
    <div className="flex items-center">
      {variants[variant]}
    </div>
  );
};