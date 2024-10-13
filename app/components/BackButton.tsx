import Link from 'next/link'

export default function BackButton() {
  return (
    <div className="w-10 py-3 bg-gray-800 fixed bottom-0 left-0 rounded-r-lg">
      <div className="flex justify-center max-w-screen-lg mx-auto">
        <Link
          href="/"
          className="font-medium text-white hover:text-blue-300"
        >
          ⬅️
        </Link>
      </div>
    </div>
  )
}
