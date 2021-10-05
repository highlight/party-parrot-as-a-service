import { useEffect, useState } from "react";
import frame0 from "./favicon/frame0.gif";
import frame1 from "./favicon/frame1.gif";
import frame2 from "./favicon/frame2.gif";
import frame3 from "./favicon/frame3.gif";
import frame4 from "./favicon/frame4.gif";
import frame5 from "./favicon/frame5.gif";
import frame6 from "./favicon/frame6.gif";
import frame7 from "./favicon/frame7.gif";
import frame8 from "./favicon/frame8.gif";

export const useAnimatedFavicon = () => {
  const [index, setIndex] = useState(0);

  const favicon_images = [
    frame0,
    frame1,
    frame2,
    frame3,
    frame4,
    frame5,
    frame6,
    frame7,
    frame8,
  ];

  useEffect(() => {
    const step = () => {
      // remove current favicon
      if (document.querySelector("link[rel='icon']") !== null)
        document.querySelector("link[rel='icon']")!.remove();
      if (document.querySelector("link[rel='shortcut icon']") !== null)
        document.querySelector("link[rel='shortcut icon']")!.remove();

      setIndex((previousIndex) => {
        // add new favicon image
        document
          .querySelector("head")!
          .insertAdjacentHTML(
            "beforeend",
            '<link rel="icon" href="' +
              favicon_images[previousIndex] +
              '" type="image/gif">'
          );

        if (previousIndex === favicon_images.length - 1) {
          return 0;
        } else {
          return previousIndex + 1;
        }
      });

      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
};
