// /* eslint-disable no-debugger */
// /* eslint-disable @typescript-eslint/no-use-before-define */
// /* eslint-disable prefer-const */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {  useRef, useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// // css
// import "./RichText.css";

// interface IRichTextProps {
//   noActionBtns?: boolean;
//   currentSectionData?: any;
//   activeIndex?: any;
//   setSectionData?: any;
//   ID?: any;
//   onChange?: any;
//   currentDocRole?: any;
//   checkChanges?: any;
// }

// const RichText = ({
// }: IRichTextProps): JSX.Element => {

//   const quillRef = useRef<any>(null);

//   const modules: any = {
//     toolbar: [
//       [
//         {
//           header: [1, 2, 3, false],
//         },
//       ],
//       ["bold", "italic", "underline"],
//       [{ background: [] }],
//       [
//         {
//           list: "ordered",
//         },
//         {
//           list: "bullet",
//         },
//         {
//           indent: "-1",
//         },
//         {
//           indent: "+1",
//         },
//       ],
//       ["image"],
//       ["clean"],
//     ],
//   };

//   const formats: string[] = [
//     "header",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "blockquote",
//     "list",
//     "bullet",
//     "indent",
//     "link",
//     "image",
//     "video",
//     // "color",
//     "background",
//   ];

//   // const [newAttachment, setNewAttachment] = useState<boolean>(true);
//   const [description, setDescription] = useState<string>("");

//   const handleChange = async (
//     html: string,
//     delta: any,
//     source: any,
//     editor: any
//   ): Promise<any> => {
//     if (quillRef.current) {

//       // setDescription(editor.getHTML());
//       const htmlContent = editor.getHTML();
//       const parser = new DOMParser();
//       const doc = parser.parseFromString(htmlContent, "text/html");
//       const indentElements = doc.querySelectorAll("[class^='ql-indent-']");
//       // Loop through all indented elements
//       indentElements.forEach((element: any) => {
//         // Extract the indent level from the class (e.g., ql-indent-1 -> 1)
//         const indentClass: any = Array.from(element.classList).find(
//           (cls: any) => cls.startsWith("ql-indent-")
//         );
//         const indentLevel = parseInt(indentClass.split("-")[2], 10);

//         // Apply the margin-left based on indent level (32px * level)
//         const marginLeft = `${indentLevel * 32}px`;

//         // Add the margin-left inline style
//         element.style.marginLeft = marginLeft;
//       });

//       const updatedHtml = doc.body.innerHTML;

//       setDescription(updatedHtml);

//       return editor.getHTML();
//     }

//     // setDescription(html === "<p><br></p>" ? "" : html);
//     // onChange && onChange(html === "<p><br></p>" ? "" : html);
//     // return html;
//   };

//   return (

//         <ReactQuill
//           ref={quillRef}
//           theme="snow"
//           modules={modules}
//           formats={formats}
//           value={description}
//           readOnly={false}
//           placeholder="Content goes here"
//           className="customeRichText"
//           // onChange={(text) => {
//           //   _handleOnChange(text);
//           // }}
//           onChange={handleChange}
//         />
//   );
// };

// export default RichText;

import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichText.css";
import styles from "./RichText.module.scss";

interface IRichTextProps {
  value?: string;
  isValid?: boolean;
  errorMsg?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  modules?: any;
  formats?: string[];
  className?: string;
}

const RichText = ({
  value = "",
  onChange,
  placeholder = "Start typing here...",
  readOnly = false,
  modules,
  formats,
  isValid,
  errorMsg,
  className = "customRichText",
}: IRichTextProps): JSX.Element => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [content, setContent] = useState<string>(value);

  // Default modules and formats
  const defaultModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ color: [] }],
      // [{ background: [] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      // ["image"],
      ["clean"],
    ],
  };

  const defaultFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "indent",
    "link",
    "color",

    // "image",
    // "background",
  ];

  // Handle change in content
  const handleChange = (html: string, delta: any, source: any, editor: any) => {
    setContent(html === "<p><br></p>" ? "" : html); // Handle empty content
    onChange?.(html === "<p><br></p>" ? "" : html); // Call the onChange callback if provided
  };

  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        readOnly={readOnly}
        placeholder={placeholder}
        className={className}
        modules={modules || defaultModules}
        formats={formats || defaultFormats}
        onChange={handleChange}
      />

      {isValid && (
        <p
          className={styles.errorMsg}
          style={{
            textAlign: isValid ? "left" : "right",
          }}
        >
          {errorMsg}
        </p>
      )}
    </>
  );
};

export default RichText;
