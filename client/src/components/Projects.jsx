// //projects.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
// import { server } from "../constant";
// import useTokenValidation from "./UseTockenValidation";


// const Projects = () => {
//     useTokenValidation();
//     const [cards, setCards] = useState([]);
//     const [showTooltipIndex, setShowTooltipIndex] = useState(null);
//     const [editableCard, setEditableCard] = useState(null);
//     const [renameDialogVisible, setRenameDialogVisible] = useState(false);
//     const [renameInputValue, setRenameInputValue] = useState("");
//     const [descriptionInputValue, setDescriptionInputValue] = useState("");
//     const [renameIndex, setRenameIndex] = useState(null);
//     const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
//     const [deleteIndex, setDeleteIndex] = useState(null);
//     const navigate = useNavigate();
//     const menuRef = useRef(null);
//     const [userRole, setUserRole] = useState("");
//     const [organizationId, setOrganizationId] = useState(null);
//     const [newCardErrors, setNewCardErrors] = useState({
//         name: false,
//         description: false,
//         email: false,
//     });
//     const [projectManager, setProjectManager] = useState("");
//     const [emailSuggestions, setEmailSuggestions] = useState([]);

//     const [isAddingCard, setIsAddingCard] = useState(false);


//     const [renameInputError, setRenameInputError] = useState(false);
//     const [descriptionInputError, setDescriptionInputError] = useState(false);
//     const [projectManagerError, setProjectManagerError] = useState(false);

//     useEffect(() => {
//         const fetchUserRoleAndOrganization = async () => {
//             try {
//                 const response = await axios.get(`${server}/api/role`, {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                 });
//                 setUserRole(response.data.role);
//                 setOrganizationId(response.data.organizationId);
//                 fetchProjects(response.data.organizationId);
//             } catch (error) {
//                 console.error("Error fetching user role:", error);
//             }
//         };
//         fetchUserRoleAndOrganization();
//     }, []);

//     const fetchProjects = async (organizationId) => {
//         try {
//             const response = await axios.get(
//                 `${server}/api/projects/${organizationId}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                 }
//             );
//             setCards(response.data.projects);
//         } catch (error) {
//             console.error("Error fetching projects:", error);
//         }
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) {
//                 setShowTooltipIndex(null);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     const handleCardClick = async (projectId) => {
//         try {
//             navigate(`/projects/${projectId}/tasks`);
//         } catch (error) {
//             console.error("Error fetching tasks:", error);
//         }
//     };

//     const checkDuplicateProjectName = async (name, excludeProjectId = null) => {
//         try {
//           const response = await axios.get(`${server}/api/projects/${organizationId}`, {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           });
//           const existingProjects = response.data.projects;
//           return existingProjects.some(project => 
//             project.name.toLowerCase() === name.toLowerCase() && project._id !== excludeProjectId
//           );
//         } catch (error) {
//           console.error("Error checking for duplicate project name:", error);
//           return false;
//         }
//       };

//     const handleTitleChange = (event, index) => {
//         const value = event.target.value.replace(/^\s+/, '');
//         const updatedCards = [...cards];
//         updatedCards[index].name = value;
//         setCards(updatedCards);
//         setNewCardErrors({ ...newCardErrors, name: false });
//     };


//     const handleDescriptionChange = (event, index) => {
//         const value = event.target.value.replace(/^\s+/, '');
//         const updatedCards = [...cards];
//         updatedCards[index].description = value;
//         setCards(updatedCards);
//         setNewCardErrors({ ...newCardErrors, description: false });
//     };


//     const handleEmailChange = (event, index) => {
//         const updatedCards = [...cards];
//         updatedCards[index].projectManager = event.target.value;
//         setCards(updatedCards);
//         setNewCardErrors({ ...newCardErrors, email: false });
//         setProjectManagerError(false);  // Add this line
//     };


//     const isValidEmail = (email) => {
//         const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//         return re.test(String(email).toLowerCase());
//     };



//     const handleAddCard = () => {
//         if (isAddingCard) {
//             return;
//         }

//         const newCard = {
//             _id: uuidv4(),
//             name: "",
//             description: "",
//             projectManager: "",
//             isNew: true,
//         };
//         setCards((prevCards) => [...prevCards, newCard]);
//         setEditableCard(newCard._id);
//         setNewCardErrors({ name: false, description: false, email: false });
//         setIsAddingCard(true);
//     };

//     const handleCancelNewCard = () => {
//         setCards((prevCards) =>
//             prevCards.filter((card) => card._id !== editableCard)
//         );
//         setEditableCard(null);
//         setIsAddingCard(false);
//         setNewCardErrors({ name: false, description: false, email: false });
//     };

//     // savenewcard
//     const handleSaveNewCard = async (index) => {
//         const card = cards[index];
//         const newErrors = { ...newCardErrors };
//         let hasError = false;

//         if (!card.name.trim()) {
//             newErrors.name = true;
//             hasError = true;
//         }
//         if (!card.description.trim()) {
//             newErrors.description = true;
//             hasError = true;
//         }
//         if (!card.projectManager || !isValidEmail(card.projectManager)) {
//             newErrors.email = true;
//             hasError = true;
//         }

//         if (hasError) {
//             setNewCardErrors(newErrors);
//             return;
//         }

//         // Check for duplicate project name
//         const isDuplicate = await checkDuplicateProjectName(card.name.trim());
//         if (isDuplicate) {
//             setNewCardErrors({ ...newErrors, name: true });
//             alert("A project with this name already exists. Please choose a different name.");
//             return;
//         }

//         // Check if email is part of the organization
//         try {
//             const response = await axios.get(`${server}/api/users/search`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//                 params: { email: card.projectManager, organizationId: organizationId },
//             });

//             if (response.data.users.length === 0) {
//                 setNewCardErrors({ ...newErrors, email: true });
//                 setProjectManagerError(true);
//                 return;
//             }
//         } catch (error) {
//             console.error("Error checking project manager email:", error);
//             setNewCardErrors({ ...newErrors, email: true });
//             setProjectManagerError(true);
//             return;
//         }

//         // If we've made it here, the project name is unique, email is valid and part of the organization
//         try {
//             const response = await axios.post(
//                 `${server}/api/projects`,
//                 {
//                     organizationId: organizationId,
//                     name: card.name.trim(),
//                     description: card.description.trim(),
//                     projectManager: card.projectManager,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                 }
//             );
//             setEditableCard(null);
//             setIsAddingCard(false);
//             fetchProjects(organizationId);
//         } catch (error) {
//             console.error("Error creating new project:", error);
//             setIsAddingCard(false);
//         }
//     };

//     const handleRenameCard = (index) => {
//         setRenameIndex(index);
//         setRenameInputValue(cards[index].name);
//         setDescriptionInputValue(cards[index].description);
//         setProjectManager(cards[index].projectManager);
//         setRenameDialogVisible(true);
//     };


//     const handleRenameInputChange = (event) => {
//         setRenameInputValue(event.target.value.replace(/^\s+/, ''));
//         setRenameInputError(false);
//     };

//     const handleDescriptionInputChange = (event) => {
//         setDescriptionInputValue(event.target.value.replace(/^\s+/, ''));
//         setDescriptionInputError(false);
//     };



//     const handleDeleteCard = async (cardId) => {
//         try {
//             await axios.delete(`${server}/api/projects/${cardId}`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//             });
//             setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
//             setShowTooltipIndex(null);
//         } catch (error) {
//             console.error("Error deleting project:", error);
//         }
//     };

//     const handleDelete = (index) => {
//         setDeleteIndex(index);
//         setDeleteDialogVisible(true);
//     };

//     const handleConfirmDelete = () => {
//         handleDeleteCard(cards[deleteIndex]._id);
//         setDeleteDialogVisible(false);
//         setDeleteIndex(null);
//     };

//     const handleCancelDelete = () => {
//         setDeleteDialogVisible(false);
//         setDeleteIndex(null);
//     };

//     const handleEditClick = (index) => {
//         setShowTooltipIndex(index);
//     };

//    //save rename
//     const handleSaveRename = async () => {
//         if (!renameInputValue) {
//             setRenameInputError(true);
//             return;
//         }
//         if (!descriptionInputValue) {
//             setDescriptionInputError(true);
//             return;
//         }
//         if (!projectManager) {
//             setProjectManagerError(true);
//             return;
//         }
//         if (projectManagerError) {
//             return;
//         }

//         // Check for duplicate project name
//         const isDuplicate = await checkDuplicateProjectName(renameInputValue.trim(), cards[renameIndex]._id);
//         if (isDuplicate) {
//             setRenameInputError(true);
//             alert("A project with this name already exists. Please choose a different name.");
//             return;
//         }

//         try {
//             const response = await axios.put(
//                 `${server}/api/projects/${cards[renameIndex]._id}`,
//                 {
//                     name: renameInputValue,
//                     description: descriptionInputValue,
//                     projectManager: projectManager,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                 }
//             );

//             const updatedProject = response.data.project;

//             setCards(prevCards => prevCards.map(card =>
//                 card._id === updatedProject._id ? updatedProject : card
//             ));

//             setRenameDialogVisible(false);
//             setRenameIndex(null);
//             setShowTooltipIndex(null);
//         } catch (error) {
//             console.error("Error renaming project:", error);
//         }
//     };

//     const handleProjectManagerChange = async (event) => {
//         const value = event.target.value;
//         setProjectManager(value);
//         setProjectManagerError(false);

//         if (value) {
//             try {
//                 const response = await axios.get(`${server}/api/users/search`, {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem("token")}`,
//                     },
//                     params: { email: value, organizationId: organizationId },
//                 });

//                 if (response.data.users.length > 0) {
//                     setEmailSuggestions(response.data.users);
//                     setProjectManagerError(false);
//                 } else {
//                     setEmailSuggestions([]);
//                     setProjectManagerError(true);
//                 }
//             } catch (error) {
//                 console.error("Error fetching user emails:", error);
//                 setEmailSuggestions([]);
//                 setProjectManagerError(true);
//             }
//         } else {
//             setEmailSuggestions([]);
//             setProjectManagerError(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-light-white rounded-3xl p-8">
//             <div className="flex justify-between items-center mb-4">
//                 {userRole === 'ADMIN' && (
//                     <button
//                         className="border border-blue-500 text-blue-500 py-2 px-4 rounded-full flex items-center hover:bg-blue-500 hover:text-white"
//                         onClick={handleAddCard}
//                         disabled={isAddingCard}
//                     >
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-4 w-4 mr-1"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                         >
//                             <path
//                                 fillRule="evenodd"
//                                 d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
//                                 clipRule="evenodd"
//                             />
//                         </svg>
//                         Add Project
//                     </button>
//                 )}
//             </div>
//             <div className="flex flex-wrap justify-right">
//                 {cards.map((card, index) => (
//                     <div
//                         key={card._id}
//                         className=" bg-white rounded-3xl border-t-4 border-black relative shadow-xl p-6 m-4 w-72 cursor-pointer"

//                     >
//                         {editableCard === card._id ? (
//                             <div >
//                                 <label
//                                     className="block text-gray-700 text-sm font-bold mb-2"

//                                     htmlFor="text"
//                                 >
//                                     Project Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     placeholder=" project name"
//                                     value={card.name}
//                                     onChange={(event) => handleTitleChange(event, index)}
//                                     className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${newCardErrors.name ? "border-red-500" : ""
//                                         }`}
//                                     onClick={(e) => e.stopPropagation()}
//                                 />
//                                 {newCardErrors.name && (
//                                     <span className="text-red-500">This field is required</span>
//                                 )}
//                                 <label
//                                     className="block text-gray-700 pt-2 text-sm font-bold mb-2"
//                                     htmlFor="text"
//                                 >
//                                     Project Description
//                                 </label>
//                                 <textarea
//                                     placeholder="Project description"
//                                     value={card.description}
//                                     onChange={(event) => handleDescriptionChange(event, index)}
//                                     className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.description ? "border-red-500" : ""
//                                         }`}
//                                     onClick={(e) => e.stopPropagation()}
//                                 />
//                                 {newCardErrors.description && (
//                                     <span className="text-red-500">This field is required</span>
//                                 )}
//                                 <label
//                                     className="block text-gray-700 text-sm font-bold mb-2"
//                                     htmlFor="text"
//                                 >
//                                     Project Manager
//                                 </label>
//                                 <input
//                                     type="email"
//                                     placeholder="Project manager email"
//                                     value={card.projectManager}
//                                     onChange={(event) => {
//                                         handleProjectManagerChange(event);
//                                         setCards((prevCards) => {
//                                             const updatedCards = [...prevCards];
//                                             updatedCards[index].projectManager = event.target.value;
//                                             return updatedCards;
//                                         });
//                                     }}
//                                     className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.email || projectManagerError ? "border-red-500" : ""
//                                         }`}
//                                     onClick={(e) => e.stopPropagation()}
//                                 />
//                                 {newCardErrors.email && (
//                                     <span className="text-red-500">This field is required</span>
//                                 )}

//                                 {newCardErrors.email && (
//                                     <span className="text-red-500">
//                                         {projectManagerError
//                                             ? "Email is not part of the organization"
//                                             : "This field is required"}
//                                     </span>
//                                 )}
//                                 {emailSuggestions.length > 0 && card.projectManager.length > 0 && (
//                                     <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
//                                         {emailSuggestions.map((user) => (
//                                             <li
//                                                 key={user._id}
//                                                 className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                                 onClick={() => {
//                                                     setCards((prevCards) => {
//                                                         const updatedCards = [...prevCards];
//                                                         updatedCards[index].projectManager = user.email;
//                                                         return updatedCards;
//                                                     });
//                                                     setProjectManager(user.email);
//                                                     setEmailSuggestions([]);
//                                                     setProjectManagerError(false);
//                                                 }}
//                                             >
//                                                 {user.email}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}

//                                 <div className="flex justify-between">
//                                     <button
//                                         className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
//                                         onClick={() => handleSaveNewCard(index)}
//                                     >
//                                         Save
//                                     </button>
//                                     <button
//                                         className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mt-2"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             handleCancelNewCard();
//                                         }}
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 <div onClick={() => handleCardClick(card._id)}>
//                                     <div className="relative group">
//                                         <span className="block truncate max-w-[200px]">
//                                             {card.name}
//                                         </span>
//                                         {card.name.length > 20 && (
//                                             <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
//                                                 {card.name}
//                                             </span>
//                                         )}
//                                     </div>
//                                     <div className="relative group mt-2">
//                                         <span className="block truncate max-w-[200px] text-gray-500">
//                                             {card.description}
//                                         </span>
//                                         {card.description.length > 20 && (
//                                             <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
//                                                 {card.description}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="absolute top-0 right-0 p-2">
//                                     {userRole !== "USER" && (
//                                         <button
//                                             className="text-gray-500 hover:text-gray-700"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleEditClick(index);
//                                             }}
//                                         >
//                                             &#x2022;&#x2022;&#x2022;
//                                         </button>
//                                     )}
//                                     {showTooltipIndex === index && (
//                                         <div
//                                             className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg"
//                                             ref={menuRef}
//                                             onClick={(e) => e.stopPropagation()}
//                                         >
//                                             <button
//                                                 className="block w-full text-left px-4 py-2 text-gray-700 rounded-2xl hover:bg-gray-100"
//                                                 onClick={() => handleRenameCard(index)}
//                                             >
//                                                 Rename
//                                             </button>
//                                             <button
//                                                 className="block w-full text-left px-4 py-2 text-red-500 rounded-2xl hover:bg-gray-100"
//                                                 onClick={() => handleDelete(index)}
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                 ))}
//             </div>

//             {renameDialogVisible && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-6 w-96 rounded-3xl  shadow-4xl">
//                         <h2 className="block text-gray-700 text-lg font-bold mb-2">
//                             Rename Project
//                         </h2>
//                         <label
//                             className="block text-gray-700 text-sm font-bold mb-2"
//                             htmlFor="text"
//                         >
//                             Project Name
//                         </label>
//                         <input
//                             type="text"
//                             className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${renameInputError ? "border-red-500" : ""
//                                 }`}
//                             value={renameInputValue}
//                             onChange={handleRenameInputChange}
//                             placeholder="Project Name"
//                             required
//                         />
//                         {renameInputError && (
//                             <span className="text-red-500 ">Project Name is required</span>
//                         )}
//                         <label
//                             className="block text-gray-700 text-sm font-bold mb-2"
//                             htmlFor="text"
//                         >
//                             Description
//                         </label>
//                         <textarea
//                             className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${descriptionInputError ? "border-red-500" : ""
//                                 }`}
//                             value={descriptionInputValue}
//                             onChange={handleDescriptionInputChange}
//                             placeholder="Project Description"
//                             required
//                         />
//                         {descriptionInputError && (
//                             <span className="text-red-500">
//                                 Project Description is required
//                             </span>
//                         )}
//                         {projectManagerError && (
//                             <span className="text-red-500">
//                                 Project Manager Email is required
//                             </span>
//                         )}

//                         <div className=" flex justify-between px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                             <button
//                                 className="mt-3 w-full   rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//                                 onClick={() => setRenameDialogVisible(false)}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="w-full   rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                                 onClick={handleSaveRename}
//                             >
//                                 Save
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {deleteDialogVisible && (
//                 <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
//                     <div className="bg-white p-6 rounded-3xl shadow-4xl">
//                         <h2 className="text-lg font-bold mb-4">Confirm Project Deletion</h2>
//                         <p> delete this project?</p>
//                         <div className="flex justify-between mt-4">
//                             <button
//                                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
//                                 onClick={handleCancelDelete}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="bg-red-500 text-white px-4 py-2 rounded-3xl ml-2"
//                                 onClick={handleConfirmDelete}
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Projects;


//projects.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { server } from "../constant";
import useTokenValidation from "./UseTockenValidation";


const Projects = () => {
    useTokenValidation();
    const [cards, setCards] = useState([]);
    const [showTooltipIndex, setShowTooltipIndex] = useState(null);
    const [editableCard, setEditableCard] = useState(null);
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [renameInputValue, setRenameInputValue] = useState("");
    const [descriptionInputValue, setDescriptionInputValue] = useState("");
    const [renameIndex, setRenameIndex] = useState(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [userRole, setUserRole] = useState("");
    const [organizationId, setOrganizationId] = useState(null);
    const [newCardErrors, setNewCardErrors] = useState({
        name: false,
        description: false,
        email: false,
    });
    const [projectManager, setProjectManager] = useState("");
    const [emailSuggestions, setEmailSuggestions] = useState([]);

    const [isAddingCard, setIsAddingCard] = useState(false);


    const [renameInputError, setRenameInputError] = useState(false);
    const [descriptionInputError, setDescriptionInputError] = useState(false);
    const [projectManagerError, setProjectManagerError] = useState(false);

    useEffect(() => {
        const fetchUserRoleAndOrganization = async () => {
            try {
                const response = await axios.get(`${server}/api/role`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUserRole(response.data.role);
                setOrganizationId(response.data.organizationId);
                fetchProjects(response.data.organizationId);
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };
        fetchUserRoleAndOrganization();
    }, []);

    const fetchProjects = async (organizationId) => {
        try {
            const response = await axios.get(
                `${server}/api/projects/${organizationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setCards(response.data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowTooltipIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCardClick = async (projectId) => {
        try {
            navigate(`/projects/${projectId}/tasks`);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const checkDuplicateProjectName = async (name, excludeProjectId = null) => {
        try {
            const response = await axios.get(`${server}/api/projects/${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const existingProjects = response.data.projects;
            return existingProjects.some(project =>
                project.name.toLowerCase() === name.toLowerCase() && project._id !== excludeProjectId
            );
        } catch (error) {
            console.error("Error checking for duplicate project name:", error);
            return false;
        }
    };

    const handleTitleChange = (event, index) => {
        const value = event.target.value.replace(/^\s+/, '');
        const updatedCards = [...cards];
        updatedCards[index].name = value;
        setCards(updatedCards);
        setNewCardErrors({ ...newCardErrors, name: false });
    };


    const handleDescriptionChange = (event, index) => {
        const value = event.target.value.replace(/^\s+/, '');
        const updatedCards = [...cards];
        updatedCards[index].description = value;
        setCards(updatedCards);
        setNewCardErrors({ ...newCardErrors, description: false });
    };


    const handleEmailChange = (event, index) => {
        const updatedCards = [...cards];
        updatedCards[index].projectManager = event.target.value;
        setCards(updatedCards);
        setNewCardErrors({ ...newCardErrors, email: false });
        setProjectManagerError(false);  // Add this line
    };


    const isValidEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };



    const handleAddCard = () => {
        if (isAddingCard) {
            return;
        }

        const newCard = {
            _id: uuidv4(),
            name: "",
            description: "",
            projectManager: "",
            isNew: true,
        };
        setCards((prevCards) => [...prevCards, newCard]);
        setEditableCard(newCard._id);
        setNewCardErrors({ name: false, description: false, email: false });
        setIsAddingCard(true);
    };

    const handleCancelNewCard = () => {
        setCards((prevCards) =>
            prevCards.filter((card) => card._id !== editableCard)
        );
        setEditableCard(null);
        setIsAddingCard(false);
        setNewCardErrors({ name: false, description: false, email: false });
    };

    // savenewcard
    const handleSaveNewCard = async (index) => {
        const card = cards[index];
        const newErrors = { ...newCardErrors };
        let hasError = false;

        if (!card.name.trim()) {
            newErrors.name = true;
            hasError = true;
        }
        if (!card.description.trim()) {
            newErrors.description = true;
            hasError = true;
        }
        if (!card.projectManager || !isValidEmail(card.projectManager)) {
            newErrors.email = true;
            hasError = true;
        }

        if (hasError) {
            setNewCardErrors(newErrors);
            return;
        }

        // Check for duplicate project name
        const isDuplicate = await checkDuplicateProjectName(card.name.trim());
        if (isDuplicate) {
            setNewCardErrors({ ...newErrors, name: true });
            alert("A project with this name already exists. Please choose a different name.");
            return;
        }

        // Check if email is part of the organization
        try {
            const response = await axios.get(`${server}/api/users/search`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: { email: card.projectManager, organizationId: organizationId },
            });

            if (response.data.users.length === 0) {
                setNewCardErrors({ ...newErrors, email: true });
                setProjectManagerError(true);
                return;
            }
        } catch (error) {
            console.error("Error checking project manager email:", error);
            setNewCardErrors({ ...newErrors, email: true });
            setProjectManagerError(true);
            return;
        }

        // If we've made it here, the project name is unique, email is valid and part of the organization
        try {
            const response = await axios.post(
                `${server}/api/projects`,
                {
                    organizationId: organizationId,
                    name: card.name.trim(),
                    description: card.description.trim(),
                    projectManager: card.projectManager,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setEditableCard(null);
            setIsAddingCard(false);
            fetchProjects(organizationId);
        } catch (error) {
            console.error("Error creating new project:", error);
            setIsAddingCard(false);
        }
    };

    const handleRenameCard = (index) => {
        setRenameIndex(index);
        setRenameInputValue(cards[index].name);
        setDescriptionInputValue(cards[index].description);
        setProjectManager(cards[index].projectManager);
        setRenameDialogVisible(true);
    };


    const handleRenameInputChange = (event) => {
        setRenameInputValue(event.target.value.replace(/^\s+/, ''));
        setRenameInputError(false);
    };

    const handleDescriptionInputChange = (event) => {
        setDescriptionInputValue(event.target.value.replace(/^\s+/, ''));
        setDescriptionInputError(false);
    };



    const handleDeleteCard = async (cardId) => {
        try {
            await axios.delete(`${server}/api/projects/${cardId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
            setShowTooltipIndex(null);
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleDelete = (index) => {
        setDeleteIndex(index);
        setDeleteDialogVisible(true);
    };

    const handleConfirmDelete = () => {
        handleDeleteCard(cards[deleteIndex]._id);
        setDeleteDialogVisible(false);
        setDeleteIndex(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogVisible(false);
        setDeleteIndex(null);
    };

    const handleEditClick = (index) => {
        setShowTooltipIndex(index);
    };

    //save rename
    const handleSaveRename = async () => {
        if (!renameInputValue) {
            setRenameInputError(true);
            return;
        }
        if (!descriptionInputValue) {
            setDescriptionInputError(true);
            return;
        }
        if (!projectManager) {
            setProjectManagerError(true);
            return;
        }
        if (projectManagerError) {
            return;
        }

        // Check for duplicate project name
        const isDuplicate = await checkDuplicateProjectName(renameInputValue.trim(), cards[renameIndex]._id);
        if (isDuplicate) {
            setRenameInputError(true);
            alert("A project with this name already exists. Please choose a different name.");
            return;
        }

        try {
            const response = await axios.put(
                `${server}/api/projects/${cards[renameIndex]._id}`,
                {
                    name: renameInputValue,
                    description: descriptionInputValue,
                    projectManager: projectManager,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const updatedProject = response.data.project;

            setCards(prevCards => prevCards.map(card =>
                card._id === updatedProject._id ? updatedProject : card
            ));

            setRenameDialogVisible(false);
            setRenameIndex(null);
            setShowTooltipIndex(null);
        } catch (error) {
            console.error("Error renaming project:", error);
        }
    };

    const handleProjectManagerChange = async (event) => {
        const value = event.target.value;
        setProjectManager(value);
        setProjectManagerError(false);

        if (value) {
            try {
                const response = await axios.get(`${server}/api/users/search`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: { email: value, organizationId: organizationId },
                });

                if (response.data.users.length > 0) {
                    setEmailSuggestions(response.data.users);
                    setProjectManagerError(false);
                } else {
                    setEmailSuggestions([]);
                    setProjectManagerError(true);
                }
            } catch (error) {
                console.error("Error fetching user emails:", error);
                setEmailSuggestions([]);
                setProjectManagerError(true);
            }
        } else {
            setEmailSuggestions([]);
            setProjectManagerError(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-white rounded-3xl p-8">
            <div className="flex justify-between items-center mb-4">
                {userRole === 'ADMIN' && (
                    <button
                        className="border border-blue-500 text-blue-500 py-2 px-4 rounded-full flex items-center hover:bg-blue-500 hover:text-white"
                        onClick={handleAddCard}
                        disabled={isAddingCard}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Add Project
                    </button>
                )}
            </div>
            <div className="flex flex-wrap justify-right">
                {cards.map((card, index) => (
                    <div
                        key={card._id}
                        className=" bg-white rounded-3xl border-t-4 border-black relative shadow-xl p-6 m-4 w-72 cursor-pointer"

                    >
                        {editableCard === card._id ? (
                            <div >
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"

                                    htmlFor="text"
                                >
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    placeholder=" project name"
                                    value={card.name}
                                    onChange={(event) => handleTitleChange(event, index)}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline${newCardErrors.name ? "border-red-500" : ""
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {newCardErrors.name && (
                                    <span className="text-red-500">This field is required</span>
                                )}
                                <label
                                    className="block text-gray-700 pt-2 text-sm font-bold mb-2"
                                    htmlFor="text"
                                >
                                    Project Description
                                </label>
                                <textarea
                                    placeholder="Project description"
                                    value={card.description}
                                    onChange={(event) => handleDescriptionChange(event, index)}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.description ? "border-red-500" : ""
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {newCardErrors.description && (
                                    <span className="text-red-500">This field is required</span>
                                )}
                                <label
                                    className="block text-gray-700 text-sm font-bold mb-2"
                                    htmlFor="text"
                                >
                                    Project Manager
                                </label>
                                <input
                                    type="email"
                                    placeholder="Project manager email"
                                    value={card.projectManager}
                                    onChange={(event) => {
                                        handleProjectManagerChange(event);
                                        setCards((prevCards) => {
                                            const updatedCards = [...prevCards];
                                            updatedCards[index].projectManager = event.target.value;
                                            return updatedCards;
                                        });
                                    }}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${newCardErrors.email || projectManagerError ? "border-red-500" : ""
                                        }`}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {newCardErrors.email && (
                                    <span className="text-red-500">This field is required</span>
                                )}

                                {newCardErrors.email && (
                                    <span className="text-red-500">
                                        {projectManagerError
                                            ? "Email is not part of the organization"
                                            : "This field is required"}
                                    </span>
                                )}
                                {emailSuggestions.length > 0 && card.projectManager.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {emailSuggestions.map((user) => (
                                            <li
                                                key={user._id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setCards((prevCards) => {
                                                        const updatedCards = [...prevCards];
                                                        updatedCards[index].projectManager = user.email;
                                                        return updatedCards;
                                                    });
                                                    setProjectManager(user.email);
                                                    setEmailSuggestions([]);
                                                    setProjectManagerError(false);
                                                }}
                                            >
                                                {user.email}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="flex justify-between">
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                                        onClick={() => handleSaveNewCard(index)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mt-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelNewCard();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div onClick={() => handleCardClick(card._id)}>
                                    <div className="relative group">
                                        <span className="block truncate max-w-[200px]">
                                            {card.name}
                                        </span>
                                        {card.name.length > 20 && (
                                            <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
                                                {card.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group mt-2">
                                        <span className="block truncate max-w-[200px] text-gray-500">
                                            {card.description}
                                        </span>
                                        {card.description.length > 20 && (
                                            <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 -mt-1 ml-14">
                                                {card.description}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center mt-2">
                                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
                                            {card.projectManager.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="ml-2 text-gray-700 relative group">
                                            {card.projectManager.length > 20
                                                ? card.projectManager.substring(0, 20) + '...'
                                                : card.projectManager}
                                            {card.projectManager.length > 20 && (
                                                <span className="absolute hidden group-hover:block bg-black text-white p-2 rounded z-10 left-0 mt-1">
                                                    {card.projectManager}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 p-2">
                                    {userRole !== "USER" && (
                                        <button
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(index);
                                            }}
                                        >
                                            &#x2022;&#x2022;&#x2022;
                                        </button>
                                    )}
                                    {showTooltipIndex === index && (
                                        <div
                                            className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg"
                                            ref={menuRef}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                className="block w-full text-left px-4 py-2 text-gray-700 rounded-2xl hover:bg-gray-100"
                                                onClick={() => handleRenameCard(index)}
                                            >
                                                Rename
                                            </button>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-red-500 rounded-2xl hover:bg-gray-100"
                                                onClick={() => handleDelete(index)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {renameDialogVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 w-96 rounded-3xl  shadow-4xl">
                        <h2 className="block text-gray-700 text-lg font-bold mb-2">
                            Rename Project
                        </h2>
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="text"
                        >
                            Project Name
                        </label>
                        <input
                            type="text"
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${renameInputError ? "border-red-500" : ""
                                }`}
                            value={renameInputValue}
                            onChange={handleRenameInputChange}
                            placeholder="Project Name"
                            required
                        />
                        {renameInputError && (
                            <span className="text-red-500 ">Project Name is required</span>
                        )}
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="text"
                        >
                            Description
                        </label>
                        <textarea
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${descriptionInputError ? "border-red-500" : ""
                                }`}
                            value={descriptionInputValue}
                            onChange={handleDescriptionInputChange}
                            placeholder="Project Description"
                            required
                        />
                        {descriptionInputError && (
                            <span className="text-red-500">
                                Project Description is required
                            </span>
                        )}
                        {projectManagerError && (
                            <span className="text-red-500">
                                Project Manager Email is required
                            </span>
                        )}

                        <div className=" flex justify-between px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                className="mt-3 w-full   rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={() => setRenameDialogVisible(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-full   rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleSaveRename}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteDialogVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-3xl shadow-4xl">
                        <h2 className="text-lg font-bold mb-4">Confirm Project Deletion</h2>
                        <p> delete this project?</p>
                        <div className="flex justify-between mt-4">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-3xl ml-2"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;




