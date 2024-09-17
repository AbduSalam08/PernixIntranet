// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { memo } from "react";
// import { Persona, PersonaSize } from "@fluentui/react";
// import styles from "./Inputs.module.scss";

// interface Props {
//   data?: any;
//   positionLeft?: number;
//   positionTop?: number;
// }

// const CustomMutiplePeoplePersona: React.FC<Props> = ({
//   data,
//   positionLeft,
//   positionTop,
// }) => {
//   return (
//     <>
//       <div className={styles.personaSection}>
//         {data?.map((person: any, index: number) => {
//           return (
//             <Persona
//               styles={{
//                 root: {
//                   margin: "0 !important;",
//                   // position: "absolute",
//                   borderRadius: "50%",
//                   border: "3px solid #fff",
//                   // left: `${positionLeft && positionLeft * index}px`,
//                   // top: positionTop,
//                   zIndex: `${index}`,
//                   // ".ms-Persona ": {
//                   //   Position: "absolute",
//                   //   borderRadius: "10px",
//                   //   border: "3px solid #fff",
//                   //   left: `${positionLeft * index}px`,
//                   //   zIndex: `${index}`,
//                   // },
//                   ".ms-Persona-details": {
//                     display: "none",
//                   },
//                   ".ms-Persona-image": {
//                     width: "20px !important",
//                     height: "20px !important",
//                   },
//                   ".ms-Persona-imageArea": {
//                     width: "20px !important",
//                     height: "20px !important",
//                   },
//                 },
//               }}
//               imageUrl={
//                 "/_layouts/15/userphoto.aspx?size=S&username=" + person.email
//               }
//               title={person.name}
//               size={PersonaSize.size24}
//               key={index}
//             />
//           );
//         })}
//       </div>
//     </>
//   );
// };

// export default memo(CustomMutiplePeoplePersona);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from "react";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import styles from "./Inputs.module.scss";

interface Props {
  data?: any;
  positionLeft?: number;
  positionTop?: number;
}

const CustomMutiplePeoplePersona: React.FC<Props> = ({
  data,
  positionLeft,
  positionTop,
}) => {
  return (
    <div className={styles.personaSection}>
      <AvatarGroup>
        {data?.map((person: any, index: number) => {
          return (
            <Avatar
              key={index}
              image={`/_layouts/15/userphoto.aspx?size=S&username=${
                person.email || person.Email
              }`}
              shape="circle"
              size="normal"
              style={{
                margin: "0 !important",
                border: "3px solid #fff",
                width: "25px",
                height: "25px",
                marginLeft: data?.length > 1 ? "-10px" : "0",
                // position: "absolute",
                // left: `${positionLeft ? positionLeft * index : 0}px`,
                // top: `${positionTop ? positionTop : 0}px`,
                // zIndex: index,
              }}
              label={person.name}
            />
          );
        })}
      </AvatarGroup>
    </div>
  );
};

export default memo(CustomMutiplePeoplePersona);
