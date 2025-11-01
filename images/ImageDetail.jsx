/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { setTargetImage } from "./actions";

export default function ImageDetail({ image }) {
  if (!image) return null;

  return (
    <div className="imageDetail">
      <button
        className="backButton"
        onClick={() => setTargetImage(null)}
        aria-label="Back to list"
      >
        <span className="icon">arrow_back</span> Back to list
      </button>
      <img
        src={image.url}
        alt={image.description}
        className="detailImage"
      />
      <div className="detailContent">
        <p>{image.description}</p>
      </div>
    </div>
  );
}