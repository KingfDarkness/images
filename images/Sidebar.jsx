/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import c from "clsx";
import useStore from "./store";
import { setSidebarOpen, setTargetImage } from "./actions";
import ImageDetail from "./ImageDetail.jsx";

const truncateDescription = (description, wordLimit = 7) => {
  if (!description) {
    return "";
  }
  const words = description.split(" ");
  if (words.length <= wordLimit) {
    return description;
  }
  return words.slice(0, wordLimit).join(" ") + " ...";
};

const Sidebar = () => {
  const images = useStore.use.images();
  const isSidebarOpen = useStore.use.isSidebarOpen();
  const targetImageId = useStore.use.targetImage();

  const targetImage = targetImageId
    ? images?.find((img) => img.id === targetImageId)
    : null;

  return (
    <aside className={c("sidebar", { open: isSidebarOpen })}>
      <button
        className="closeButton"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <span className="icon">close</span>
      </button>

      {targetImage ? (
        <ImageDetail image={targetImage} />
      ) : (
        <>
          <div style={{ padding: "0 15px" }}>
            <h2>All Images</h2>
          </div>
          <ul>
            {images?.map((image) => (
              <li key={image.id} onClick={() => setTargetImage(image.id)}>
                <img
                  src={image.url}
                  alt={truncateDescription(image.description, 3)}
                  className="thumbnail"
                />
                <p>{image.description}</p>
              </li>
            ))}
            {(!images || images.length === 0) && <li>No images available.</li>}
          </ul>
        </>
      )}
    </aside>
  );
};

export default Sidebar;