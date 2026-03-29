import { Link } from "react-router-dom";

const ProfileItem = ({
  title,
  subtitle,
  image_url = "",
  link = "",
}: {
  title: string;
  subtitle: string;
  image_url?: string;
  link?: string;
}) => {
  const content = (
    <div className="flex items-center gap-2">
      {image_url ? (
        <img
          src={image_url}
          alt={title}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-bold text-blue-600">
            {title.charAt(0)}
          </span>
        </div>
      )}
      <div>
        <h2 className="font-medium text-sm">{title}</h2>
        <p className="text-xs opacity-60">{subtitle}</p>
      </div>
    </div>
  );

  if (!link) return content;

  return <Link to={link}>{content}</Link>;
};

export default ProfileItem;
