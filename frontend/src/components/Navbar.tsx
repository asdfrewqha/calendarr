import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 flex justify-between items-center">
      <Link to="/" className="text-lg font-bold text-tg">Календарь</Link>
      <div className="flex gap-4 text-sm">
        <Link to="/create" className="text-lg font-bold text-tg hover:underline">Создать</Link>
      </div>
    </nav>
  );
}
