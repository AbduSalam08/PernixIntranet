/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import "quill-mention";
import "./QuillEditor.module.scss";
import styles from "./QuillEditor.module.scss";
import { Persona, PersonaSize } from "office-ui-fabric-react";
import ReactDOM from "react-dom";
import { Avatar } from "primereact/avatar";
import { useSelector } from "react-redux";
import { debouncer } from "../../../utils/commonUtils";

const QuillEditor = ({
  onChange,
  placeHolder,
  defaultValue,
  suggestionList,
  getMentionedEmails,
  height,
}: any): JSX.Element => {
  //   const [suggestions, setSuggestions] = useState([]);
  //   const [mentionedUsers, setMentionedUsers] = useState([]);
  const [content, setContent] = useState(defaultValue || "");
  const quillRef = useRef<any>(null);
  const AllUsersData = useSelector((state: any) => state.AllUsersData?.value);
  // const suggestionItems: any = suggestionList?.map((e: any) => {
  //   return {
  //     id: e?.id,
  //     value: e?.name,
  //     email: e?.email,
  //   };
  // // });
  // useEffect(() => {
  //   if (suggestionList?.length > 0) {
  //     const suggestionItems: any = suggestionList?.map(
  //       (e: any, index: number) => {
  //         return {
  //           id: e?.id || index + 1,
  //           value: e?.name,
  //           email: e?.email || "email" + index,
  //         };
  //       }
  //     );
  //     setSObjList(suggestionItems);
  //   }
  // }, [suggestionList]);
  // console.log("suggestionItems: ", suggestionItems);

  function suggestPeople(searchTerm: any): any {
    // const allPeople = [
    //   {
    //     id: 1,
    //     value: "Fredrik Sundqvist",
    //     email: "fre@fre.com",
    //   },
    //   {
    //     id: 2,
    //     value: "Patrik Sjölin",
    //     email: "abc@erf.com",
    //   },
    // ];
    if (!searchTerm) return [];

    return AllUsersData?.filter((person: any) =>
      person.value?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }

  function getMentionValues(className: any): any {
    const parser = new DOMParser();

    const paresedHTML = content && parser.parseFromString(content, "text/html");

    const mentionElements =
      content && paresedHTML.getElementsByClassName(className);

    let mentionValues: any = [];
    if (mentionElements.length && content) {
      mentionValues = Array.from(mentionElements).map((e: any) =>
        e?.getAttribute("data-value")
      );
    }
    return mentionValues;
  }

  function filterPeopleByMentions(allPeople: any, mentionValues: any): void {
    const filteredPeople = allPeople?.filter((el: any) =>
      mentionValues?.includes(el?.value)
    );

    // const uniqueEmails = Array.from(
    //   new Set(filteredPeople?.map((e) => e?.email))
    // );
    return filteredPeople;
  }

  // Example usage:
  const [searchTerm, setSearchTerm] = useState("");
  console.log("searchTerm: ", searchTerm);
  const mentionValues = getMentionValues("mention");

  const uniqueEmails = filterPeopleByMentions(
    AllUsersData || [],
    mentionValues
  );

  let quill: any;

  const changeListsAndIcons = (): void => {
    console.log("oke");
    const mentionListItems = document.getElementsByClassName(
      "ql-mention-list-item"
    );

    const matchedPeople = suggestPeople(searchTerm);

    if (mentionListItems.length > 0) {
      for (let i = 0; i < mentionListItems.length; i++) {
        if (matchedPeople.length > i) {
          // Ensure matchedPeople[i] exists
          const element = mentionListItems.item(i);
          if (element instanceof HTMLElement) {
            ReactDOM.render(
              <div key={matchedPeople[i]?.id} className={styles.suggestionItem}>
                <Avatar
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${matchedPeople[i]?.email}`}
                  shape="circle"
                  size="normal"
                  title={matchedPeople[i]?.email || "Unknown Email"}
                  style={{
                    margin: "0 !important",
                    width: "30px",
                    height: "30px",
                    marginRight: "10px",
                  }}
                />
                <div className={styles.userDetails}>
                  <p>{matchedPeople[i]?.value || "Unknown Name"}</p>
                  <span>{matchedPeople[i]?.email || "Unknown Email"}</span>
                </div>
              </div>,
              element
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    // Initialize Quill with the mention module
    quill = new Quill("#quill-editor", {
      theme: "snow", // or use another theme
      placeholder: placeHolder || "Enter Comments, @ to mention",
      modules: {
        toolbar: [
          // ["bold", "italic", "underline", "align", "strike", "list", "clear"],
          ["bold", "italic", "underline", "list", "clean"],
          // Add other toolbar options as needed
        ],
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ["@"],

          source: debouncer(async function (
            searchTerm: string,
            renderList: any
          ) {
            setSearchTerm(searchTerm);
            const matchedPeople = suggestPeople(searchTerm); // Fetch matching people
            console.log("Matched People: ", matchedPeople);
            renderList(matchedPeople, searchTerm); // Pass the results to renderList
          },
          500),

          // async function(searchTerm: any, renderList: any, mentionsChar: any) {
          //   const matchedPeople = debouncer(suggestPeople(searchTerm), 2000);

          //   console.log("matchedPeople: ", matchedPeople);
          //   setSearchTerm(searchTerm);
          //   // renderList(matchedPeople, searchTerm);
          // },
        },
      },
    });

    quill.on("text-change", (delta: any, oldDelta: any, source: any) => {
      // Handle text changes here
      const quillContent = quill.root.innerHTML;
      onChange?.(quillContent);
      setContent(quillContent);
    });

    quillRef.current = quill;

    const mentionListItems = document.getElementsByClassName(
      "ql-mention-list-item"
    );
    const matchedPeople = suggestPeople(searchTerm);

    if (mentionListItems.length > 0) {
      for (let i = 0; i < mentionListItems.length; i++) {
        const element = mentionListItems.item(i);
        if (element instanceof HTMLElement) {
          ReactDOM.render(
            <div key={matchedPeople[i].email} className={styles.suggestionItem}>
              <Persona
                title={matchedPeople[i]?.email}
                imageUrl={`/_layouts/15/userphoto.aspx?username=${matchedPeople[i]?.email}`}
                size={PersonaSize.size32}
              />
              <div className={styles.userDetails}>
                <p>{matchedPeople[i]?.value}</p>
                <span>{matchedPeople[i]?.email}</span>
              </div>
            </div>,
            element
          );
        }
      }
    }

    const liIcon = document.getElementsByClassName("ql-list");
    if (liIcon.length > 0) {
      for (let i = 0; i < liIcon.length; i++) {
        const element = liIcon.item(i);
        if (element instanceof HTMLElement) {
          ReactDOM.render(<i className="pi pi-list" />, element);
        }
      }
    }

    // Cleanup function to destroy the Quill instance when the component unmounts
    return () => {
      const quillInstance = quillRef.current;
      if (quillInstance) {
        quillInstance.root.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (defaultValue === "") {
      quillRef.current.root.innerHTML = "";
    }
  }, [defaultValue]);

  useEffect(() => {
    onChange(content);
    getMentionedEmails(uniqueEmails);
  }, [content]);

  useEffect(() => {
    if (searchTerm) {
      changeListsAndIcons();
    }
    // window.addEventListener("keypress", (e) => {
    //   changeListsAndIcons();
    // });
    // window.addEventListener("keydown", (e) => {
    //   changeListsAndIcons();
    // });
    // window.addEventListener("keyup", (e) => {
    //   changeListsAndIcons();
    // });
  }, [searchTerm]);

  return (
    <div className="quill-editor-wrapper">
      <style>
        {`
          .ql-container {
            height: ${`${height} !important` || "auto"};
          }
          .ql-editor {
            height: ${`${height} !important` || "auto"};
          }
        `}
      </style>
      <div
        id="quill-editor"
        className="quill-editor"
        // dangerouslySetInnerHTML={{ __html: defaultValue }}
      />
    </div>
  );
};

export default QuillEditor;
