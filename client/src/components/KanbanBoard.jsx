//kanban.jsx
import React, { useState, useRef, useEffect } from "react";
import Board, { moveCard, moveColumn } from "@lourenci/react-kanban";
import {
  BsPencilSquare,
  BsThreeDotsVertical,
  BsTrash,
  BsX,
} from "react-icons/bs";
import "@lourenci/react-kanban/dist/styles.css";
import { useParams } from "react-router-dom";
import { server } from "../constant";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import "../components/Style.css";
import useTokenValidation from "./UseTockenValidation";


const initialBoard = {
  columns: [],
};

function KanbanBoard() {
  useTokenValidation();
  const [boardData, setBoardData] = useState(initialBoard);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const containerRef = useRef(null);
  const { projectId } = useParams();

  const [renameColumnError, setRenameColumnError] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [newColumnModalVisible, setNewColumnModalVisible] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [showRenameConfirmation, setShowRenameConfirmation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [renameCardModalVisible, setRenameCardModalVisible] = useState(false);
  const [renameCardTitle, setRenameCardTitle] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [memberAdded, setMemberAdded] = useState(false);

  const [renameCardDescription, setRenameCardDescription] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const suggestionListRef = useRef(null);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState(""); //added
  const [team, setTeam] = useState(""); //added
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState({});
  const [renameCardErrors, setRenameCardErrors] = useState({ title: '', description: '' });
  const [addCardErrors, setAddCardErrors] = useState({ title: '', description: '', email: '' });


  const [newColumnError, setNewColumnError] = useState(false);

  const handleTeamsClick = () => {
    navigate(`/projects/${projectId}/teams`);
  };

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUserRole(response.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser({ role: response.data.role, email: response.data.email });
        fetchProjects(response.data.organizationId);

      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  const fetchProjects = async (organizationId) => {
    try {
      const response = await axios.get(`${server}/api/projects/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProjects(response.data.projects);
      const project = response.data.projects.find(project => project._id === projectId);
      if (project) {
        setProjectName(project.name);
        setProjectManager(project.projectManager)
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Function to get the user object from local storage
  const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Inside your component
  const userFromLocalStorage = getUserFromLocalStorage();
  const emailFromLocalStorage = userFromLocalStorage ? userFromLocalStorage.email : null;

  const canShowActions = userFromLocalStorage && (user.role === 'ADMIN' || emailFromLocalStorage === projects.find(project => project._id === projectId)?.projectManager);



  // Update fetchTasks function to include cards
  async function fetchTasks() {
    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const { tasks } = await response.json();

      const columns = await Promise.all(
        tasks.map(async (task) => {
          const cardsResponse = await fetch(
            `${server}/api/tasks/${task.id}/cards`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const { cards } = await cardsResponse.json();

          return {
            id: task.id,
            title: task.name,
            cards: cards.map((card) => ({
              id: card.id,
              title: card.name,
              description: card.description,
              columnId: task.id,
              assignedTo: card.assignedTo,
              status: card.status,
            })),
          };
        })
      );

      setBoardData({ columns });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  //added
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMemberAdded(false); // Reset the state
    setEmail('');
    setTeam('');
  };

  const openRenameCardModal = (
    columnId,
    cardId,
    currentTitle,
    currentDescription
  ) => {
    console.log(
      "openRenameCardModal called with:",
      columnId,
      cardId,
      currentTitle,
      currentDescription
    );
    setSelectedColumnId(columnId);
    setSelectedCardId(cardId);
    setRenameCardTitle(currentTitle);
    setRenameCardDescription(currentDescription);
    setRenameCardModalVisible(true);
  };

  const clearFieldsAndRefresh = async () => {
    // Clear input fields
    if (document.forms[0]) {
      document.forms[0].reset();
    }
    setEmail('');

    // Close the modal
    setModalVisible(false);

    // Refresh board data
    await fetchTasks();
  };

  // // Update handleAddCard function
  const handleAddCard = async (e) => {
    e.preventDefault();
    const cardTitle = e.target.title.value.trim();
    const cardDescription = e.target.description.value.trim();

    if (!cardTitle || !cardDescription || !selectedColumnId || !email) {
      alert("Please enter text for both card title and description.");
      return;
    }

    try {
      // Search for the user within the project's teams
      const searchResponse = await fetch(
        `${server}/api/projects/${projectId}/users/search?email=${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error("User is not part of the project");
      }

      const { users } = await searchResponse.json();
      if (users.length === 0) {
        alert("The entered email is not part of the project.");
        return;
      }

      // Proceed to add the card
      const response = await fetch(
        `${server}/api/tasks/${selectedColumnId}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: cardTitle,
            description: cardDescription,
            assignedTo: email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add card");
      }

      await clearFieldsAndRefresh();
      // Clear input fields
      e.target.title.value = '';
      e.target.description.value = '';
      setEmail('');

      // Close the modal
      setModalVisible(false);

      // Refresh board data
      await fetchTasks();

    } catch (error) {
      console.error("Error adding card:", error);
      alert(error.message);
    }
  };

  const handleEmailChange = async (e) => {
    const emailInput = e.target.value;
    setEmail(emailInput);

    if (!emailInput) {
      setEmailSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/users/search?email=${emailInput}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch email suggestions");
      }

      const { users } = await response.json();
      setEmailSuggestions(users);
    } catch (error) {
      console.error("Error fetching email suggestions:", error);
      setEmailSuggestions([]);
    }
  };




  //cardmove
  async function handleCardMove(card, source, destination) {
    // Update the frontend state
    const updatedBoard = moveCard(boardData, source, destination);
    setBoardData(updatedBoard);

    // Update the backend
    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks/${source.fromColumnId}/cards/${card.id}/move`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ toColumnId: destination.toColumnId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to move card");
      }
    } catch (error) {
      console.error("Error moving card:", error);
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }

    const updateContainerWidth = () => {
      if (containerRef.current) {
        const boardWidth = containerRef.current.scrollWidth;
        containerRef.current.style.width = `${boardWidth}px`;
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);

    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, [projectId]);

  useEffect(() => {
    if (!newColumnModalVisible || !modalVisible) {
      fetchTasks();
    }
  }, [newColumnModalVisible, modalVisible]);

  // Update the handleCardMove function
  async function handleCardMove(card, source, destination) {
    // Update the frontend state
    const updatedBoard = moveCard(boardData, source, destination);
    setBoardData(updatedBoard);

    // Update the backend
    try {
      const response = await fetch(`${server}/api/cards/${card.id}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          sourceTaskId: source.fromColumnId,
          destinationTaskId: destination.toColumnId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to move card");
      }

      // If the move was successful, you might want to refetch the board data
      // to ensure frontend and backend are in sync
      await fetchTasks();
    } catch (error) {
      console.error("Error moving card:", error);
      // Optionally, revert the frontend state if the backend update fails
      setBoardData(boardData);
    }
  }

  const confirmRemoveCard = (columnId, cardId) => {
    setCardToDelete({ columnId, cardId });
    setShowDeleteConfirmation(true);
  };

  // Update handleRemoveCard function
  const handleRemoveCard = async () => {
    if (cardToDelete) {
      const { columnId, cardId } = cardToDelete;
      try {
        const response = await fetch(
          `${server}/api/tasks/${columnId}/cards/${cardId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove card");
        }

        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === columnId
              ? {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              }
              : column
          ),
        }));

        setShowDeleteConfirmation(false);
        setCardToDelete(null);

        // Show success message
        setShowSuccessMessage(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } catch (error) {
        console.error("Error removing card:", error);
      }
    }
  };

  // // Update handleRenameCard function
  const handleRenameCard = async (e) => {
    e.preventDefault();
    const trimmedTitle = renameCardTitle.trim();
    const trimmedDescription = renameCardDescription.trim();
    let hasErrors = false;
    const errors = { title: '', description: '' };

    if (!trimmedTitle) {
      errors.title = 'Please enter a card title';
      hasErrors = true;
    }
    if (!trimmedDescription) {
      errors.description = 'Please enter a card description';
      hasErrors = true;
    }

    if (hasErrors) {
      setRenameCardErrors(errors);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/tasks/${selectedColumnId}/cards/${selectedCardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: trimmedTitle,
            description: trimmedDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rename card");
      }

      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          if (column.id === selectedColumnId) {
            return {
              ...column,
              cards: column.cards.map((card) =>
                card.id === selectedCardId
                  ? {
                    ...card,
                    title: trimmedTitle,
                    description: trimmedDescription,
                  }
                  : card
              ),
            };
          }
          return column;
        });

        return { ...prevState, columns: updatedColumns };
      });

      setRenameCardModalVisible(false);
      setRenameCardErrors({ title: '', description: '' });

      //added
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 1000);

    } catch (error) {
      console.error("Error renaming card:", error);
    }
  };

  // Update the handleColumnMove function
  const handleColumnMove = async (column, source, destination) => {
    const updatedBoard = moveColumn(boardData, source, destination);
    setBoardData(updatedBoard);

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks/${column.id}/move`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newIndex: destination.toPosition }),
        }
      );

      if (!response.ok) throw new Error("Failed to move column");
    } catch (error) {
      console.error("Error moving column:", error);
      // Revert the frontend state in case of error
      const revertedBoard = moveColumn(updatedBoard, destination, source);
      setBoardData(revertedBoard);
    }
  };


  // // add coloumn
  const handleAddColumn = () => {
    setNewColumnError(false);
    setNewColumnModalVisible(true);
  };

  const handleAddColumnSubmit = async (e) => {
    e.preventDefault();
    const trimmedColumnName = newColumnName.trim();
    if (!trimmedColumnName) {
      setNewColumnError(true);
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: trimmedColumnName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const { task } = await response.json();
      setBoardData((prevState) => ({
        ...prevState,
        columns: [
          ...prevState.columns,
          { id: task._id, title: task.name, cards: [] },
        ],
      }));
      setNewColumnModalVisible(false);
      setNewColumnName("");
      setNewColumnError(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  // Update the handleRenameColumn function
  const handleRenameColumn = async (newColumnName) => {
    if (selectedColumnId && newColumnName) {
      try {
        const response = await fetch(
          `${server}/api/projects/${projectId}/tasks/${selectedColumnId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: newColumnName }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to rename column");
        }

        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.map((column) =>
            column.id === selectedColumnId
              ? { ...column, title: newColumnName }
              : column
          ),
        }));
      } catch (error) {
        console.error("Error renaming column:", error);
      }
    }
    closeModal();
  };

  // Update the handleRemoveColumn function
  const handleRemoveColumn = async () => {
    if (selectedColumnId) {
      try {
        const response = await fetch(
          `${server}/api/projects/${projectId}/tasks/${selectedColumnId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to remove column");
        }
  
        setBoardData((prevState) => ({
          ...prevState,
          columns: prevState.columns.filter(
            (column) => column.id !== selectedColumnId
          ),
        }));
  
        // Show success message
        setShowDeleteSuccess(true);
  
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowDeleteSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error removing column:", error);
      }
    }
    closeModal();
    setShowConfirmation(false);
  };
 

  const openModal = (columnId, type) => {
    console.log(columnId);
    setSelectedColumnId(columnId);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedColumnId(null);
    setModalType(null);
  };

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const response = await fetch(`${server}/api/projects/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }

        const project = await response.json();
        setProjectName(project.name);
        console.log(project.projectManager)
        setProjectManager(project.projectManger)
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    }

    fetchProjectDetails();
  }, [server, projectId]); // Dependencies for useEffect

  //add team
  const handleTeamSubmit = async (token) => {
    if (!email || !team) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/teams/addUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ email, teamName: team }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (response.ok) {
        alert("User added to team successfully");
        setMemberAdded(true); // Set the state to true
        handleCloseModal();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding user to team:", error);
      alert("An error occurred while adding user to team");
    }
  };


  async function handleChangeStatus(cardId, newStatus) {
    try {
      const response = await fetch(`${server}/api/cards/${cardId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          const updatedCards = column.cards.map((card) => {
            if (card.id === cardId) {
              return { ...card, status: newStatus };
            }
            return card;
          });
          return { ...column, cards: updatedCards };
        });

        return { ...prevState, columns: updatedColumns };
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  const handleaddmember = async (event) => {
    const value = event.target.value;
    setEmail(value);

    if (value) {
      try {
        const response = await axios.get(`${server}/api/users/search`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: { email: value },
        });

        setEmailSuggestions(response.data.users);
      } catch (error) {
        console.error("Error fetching user emails:", error);
      }
    } else {
      setEmailSuggestions([]);
    }
  };


  const renderCard = (card, { dragging }) => (
    <div
      className={`react-kanban-card ${dragging ? "dragging" : ""}`}
      style={{ borderRadius: "20px", maxWidth: "750px" }}
    >
      <div className="react-kanban-card__title truncate" title={card.title}>
        {card.title.length > 20 ? card.title.slice(0, 28) + "..." : card.title}
      </div>
      <div className="react-kanban-card__description truncate" title={card.description}>
        {card.description.length > 35 ? card.description.slice(0, 35) + "..." : card.description}
      </div>
      <div className="react-kanban-card__assignedTo flex items-center justify-end">
        {card.assignedTo && (
          <div
            className="profile-picture w-6 h-6 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold ml-2 relative group"
          >
            <span className="group-hover:block hidden absolute top-8 right-0 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              {card.assignedTo}
            </span>
            {card.assignedTo.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="react-kanban-card__status">
        <select
          value={card.status}
          onChange={(e) => handleChangeStatus(card.id, e.target.value)}
        >
          <option value="inprogress">Inprogress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
        <button
          className="delete-card-button"
          onClick={() => confirmRemoveCard(card.columnId, card.id)}
        >
          <BsTrash />
        </button>
        <button
          className="delete-card-button"
          onClick={() =>
            openRenameCardModal(
              card.columnId,
              card.id,
              card.title,
              card.description
            )
          }
        >
          <BsPencilSquare />
        </button>
      </div>
    </div>
  );
  ////

  return (
    <div
      className="p-4 overflow-y-auto max-h-screen bg-light-multicolor rounded-3xl"
      style={{ scrollbarWidth: "none" }}
    >
      <div>
        {renameCardModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-3xl ">
              <h2 className="text-lg font-bold mb-4">Rename Card</h2>
              <form onSubmit={handleRenameCard}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={renameCardTitle}
                    onChange={(e) => {
                      setRenameCardTitle(e.target.value);
                      setRenameCardErrors(prev => ({ ...prev, title: '' }));
                    }}
                    className={`border ${renameCardErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-3xl px-4 py-2 w-full`}
                    placeholder="Card Title"
                  />
                  {renameCardErrors.title && <p className="text-red-500 text-sm mt-1">{renameCardErrors.title}</p>}
                </div>
                <div className="mb-4">
                  <textarea
                    value={renameCardDescription}
                    onChange={(e) => {
                      setRenameCardDescription(e.target.value);
                      setRenameCardErrors(prev => ({ ...prev, description: '' }));
                    }}
                    className={`border ${renameCardErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-3xl px-4 py-2 w-full`}
                    placeholder="Card Description"
                  />
                  {renameCardErrors.description && <p className="text-red-500 text-sm mt-1">{renameCardErrors.description}</p>}
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setRenameCardModalVisible(false);
                      setRenameCardErrors({ title: '', description: '' });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showSuccessPopup && (
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
            <div className="bg-green-400 p-2 rounded-xl">
              <h2 className="text-lg text-white font-bold mb-2">Card renamed successfully</h2>
            </div>
          </div>

        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Project : {projectName}</h1>
          <h1 className="text-xl font-bold">Project Manager : {projectManager}</h1>
        </div>
        <div className="flex space-x-2 ">
          {canShowActions && (
            <button
              onClick={handleOpenModal}
              className={`${memberAdded ? 'bg-gray-400' : 'bg-green-500'
                } text-white px-4 py-2 rounded-full`}
              disabled={memberAdded}
            >
              {memberAdded ? 'Member Added' : '+ Add member'}
            </button>
          )}
          {/* added */}

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-700 z-50 bg-opacity-50">
              <div className="bg-white p-6 w-96 rounded-3xl shadow-4xl">
                <div className="relative">
                  <label className="block mb-2">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleaddmember}
                    placeholder="Enter email address"
                    className="border border-gray-300 p-2 rounded-3xl w-full"
                  />
                  {emailSuggestions.length > 0 && (
                    <ul
                      className="absolute bg-white border border-gray-300 rounded-3xl mt-2 w-full z-10"
                      ref={suggestionListRef}
                    >
                      {emailSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.email}
                          onClick={() => {
                            setEmail(suggestion.email);
                            setEmailSuggestions([]);
                          }}
                          className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                          {suggestion.email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Team:</label>
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="border border-gray-300 p-2 rounded-3xl w-full"
                  >
                    <option value="">Select a team</option>
                    <option value="Development">Development</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Testing">Testing</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-3xl mr-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                    onClick={() => handleTeamSubmit()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
            onClick={handleTeamsClick}
          >
            Teams
          </button>

          <button
            onClick={handleAddColumn}
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
          >
            + New Column
          </button>
        </div>
      </div>
      <div ref={containerRef} className="overflow-x-auto">
        <Board
          onCardDragEnd={handleCardMove}
          onColumnDragEnd={handleColumnMove}
          renderColumn={(card, columnId) => (
            <div
              style={{
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                padding: "0.5rem",
                marginBottom: "0.5rem",
                width: "300px",
                height: "130px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "20px",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <h3
                  className="font-bold"
                  style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#4A5568" }}>
                  {card.description}
                </p>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              ></div>
            </div>
          )}
          renderColumnHeader={({ title, id }) => (
            <div style={{ display: "flex", flexDirection: "column", width: "300px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#F7FAFC",
                  borderRadius: "20px"
                }}
              >
                <span
                  className="truncate max-w-[200px]"
                  title={title}
                >
                  {title}
                </span>
                <button
                  onClick={() => openModal(id, "options")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <BsThreeDotsVertical />
                </button>
              </div>
              <button
                onClick={() => openModal(id, "addCard")}
                style={{
                  width: "100%",
                  backgroundColor: "#EDF2F7",
                  borderBottomLeftRadius: "0.375rem",
                  borderBottomRightRadius: "0.375rem",
                  padding: "0.5rem",
                  color: "#4A5568",
                  textAlign: "center",
                }}
              >
                +
              </button>
            </div>
          )}
          renderCard={renderCard}
        >
          {boardData}
        </Board>
      </div>

      {modalVisible && modalType === "addCard" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white w-96  p-6 rounded-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add New Card</h2>
            <form onSubmit={handleAddCard}>
              <input
                type="text"
                name="title"
                className="border border-gray-300 rounded-xl px-4 py-2 mb-4 w-full"
                placeholder="Card Title"
                required
                onChange={(e) => e.target.value = e.target.value.trimStart()}
              />
              <textarea
                name="description"
                className="border border-gray-300 rounded-xl px-4 py-2 mb-4 w-full"
                placeholder="Card Description"
                required
                onChange={(e) => e.target.value = e.target.value.trimStart()}
              />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                className="border border-gray-300 p-2 rounded-3xl w-full"
              />
              {emailSuggestions.length > 0 && (
                <ul
                  className="absolute bg-white border border-gray-300 rounded-3xl mt-2 w-80 z-10"
                  ref={suggestionListRef}
                >
                  {emailSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.email}
                      onClick={() => {
                        setEmail(suggestion.email);
                        setEmailSuggestions([]);
                      }}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {suggestion.email}
                    </li>
                  ))}
                </ul>
              )}
              {/* Email suggestions list */}
              <div className="flex px-4 py-2 justify-between">
                <button
                  type="button"
                  onClick={clearFieldsAndRefresh}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-3xl">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this card?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCard}
                className="bg-red-500 text-white px-4 py-2 rounded-3xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
       {showDeleteSuccess && (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
        <p className="font-semibold">Column deleted successfully</p>
      </div>
    </div>
  )}
      {showSuccessMessage && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <p className="font-semibold">Card deleted successfully</p>
          </div>
        </div>
      )}

      {newColumnModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 w-96 rounded-3xl shadow-lg max-h-screen ">
            <h2 className="text-lg font-bold mb-4">Add New Column</h2>

            <form onSubmit={handleAddColumnSubmit}>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => {
                  setNewColumnName(e.target.value.trimStart());
                  setNewColumnError(false);
                }}
                className={`border ${newColumnError ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl px-3 py-3 mb-4 w-full`}
                placeholder="Column Name"
                required
              />
              {newColumnError && (
                <p className="text-red-500 text-sm mb-2">Please enter a column name</p>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setNewColumnModalVisible(false);
                    setNewColumnError(false);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-3xl"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalVisible && modalType === "options" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">Column Options</h2>
            <button
              onClick={() => setShowRenameInput(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-3xl w-full mb-2"
            >
              Rename Column
            </button>
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-3xl w-full mb-2"
            >
              Remove Column
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl w-full mb-2"
            >
              Cancel
            </button>
            <button onClick={closeModal} className="absolute top-0 right-0 m-4">
              <BsX className="text-gray-500" />
            </button>
          </div>

      
          {showConfirmation && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-3xl shadow-lg">
      <p className="text-lg font-bold mb-4">
        Are you sure you want to remove this column?
      </p>
      <div className="flex justify-between">
        <button
          onClick={handleRemoveColumn}
          className="bg-red-500 text-white px-10 py-2 rounded-full"
        >
          Yes
        </button>
        <button
          onClick={() => setShowConfirmation(false)}
          className="bg-gray-300 text-gray-700 px-10 py-2 rounded-full"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}
          {showRenameInput && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-3xl h-1/3 w-4/12 shadow-lg">
                <h2 className="text-lg font-bold mb-4">Rename Column</h2>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => {
                    setNewColumnName(e.target.value.trimStart());
                    setRenameColumnError(false);
                  }}
                  className={`border rounded-2xl p-2 w-full mb-4 ${renameColumnError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter the new name for the column"
                />
                {renameColumnError && (
                  <p className="text-red-500 text-sm mb-2">Please enter a column name</p>
                )}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (newColumnName.trim()) {
                        setShowRenameInput(false);
                        setShowRenameConfirmation(true);
                      } else {
                        setRenameColumnError(true);
                      }
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-3xl"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowRenameInput(false);
                      setRenameColumnError(false);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRenameConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <p className="text-lg font-bold mb-4">
                  Are you sure want to rename this column ?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      handleRenameColumn(newColumnName);
                      setShowRenameConfirmation(false);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-3xl"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowRenameConfirmation(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-3xl"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
