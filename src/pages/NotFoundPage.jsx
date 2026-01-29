import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="home-link">
        Back to Game Center
      </Link>
    </div>
  );
};

export default NotFoundPage;
