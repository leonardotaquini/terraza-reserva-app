import Link from "next/link";

export const Footer = () => {
    const year = new Date().getFullYear();
  return (
    <footer className="shadow w-full sm:p-2">
        <div className="text-center text-sm text-muted-foreground">
            &copy; {year} Terraza App. Desarrollado por <Link className="text-blue-500" href='https://leonardotaquini.com' target="_blank" rel="noopener noreferrer">
                Leonardo Taquini
            </Link>
        </div>
    </footer>
  )
}
