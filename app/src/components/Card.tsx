type CardProps = {
  title: string;
};
export function Card({ title }: CardProps) {
  return (
    <div className="bg-primary-dark text-white rounded-lg shadow-md overflow-hidden p-6">
      <h2 className="font-bold text-xl mb-2">{title}</h2>
      <p className="mb-4">
        This is a description of the card. You can place any content here
        related to Solana or other topics.
      </p>
      <a href="#" className="hover:underline">
        Read more
      </a>
      <div className="mt-4">
        <button className="bg-accent text-primary-dark hover:bg-accent-light rounded px-4 py-2">
          Primary Action
        </button>
        <button className="bg-secondary text-white hover:bg-secondary-light rounded px-4 py-2 ml-2">
          Secondary Action
        </button>
      </div>
    </div>
  );
}
