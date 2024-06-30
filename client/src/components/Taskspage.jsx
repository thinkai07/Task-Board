import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { server } from '../constant';
import useTokenValidation from './UseTockenValidation';

const Tasks = () => {
  useTokenValidation();
  const [cards, setCards] = useState([]);
  const [showTooltipIndex, setShowTooltipIndex] = useState(null);
  const [editableCard, setEditableCard] = useState(null);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState('');
  const [renameIndex, setRenameIndex] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${server}/api/projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.data.length > 0) {
          setCards([response.data[0]]); // Set only the first project
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowTooltipIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCardClick = async (projectId) => {
    try {
      const response = await axios.get(`${server}/api/projects/${projectId}/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const tasks = response.data;

      // Pass tasks data to the tasks page
      navigate(`/projects/${projectId}/tasks`, { state: { tasks } });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddCard = () => {
    const newCard = {
      _id: uuidv4(),
      name: '',
      description: '',
      isNew: true,
    };
    setCards((prevCards) => [...prevCards, newCard]);
    setEditableCard(newCard._id);
  };

  const handleSaveNewCard = async (index) => {
    const newCard = cards[index];
    if (!newCard.name || !newCard.description) {
      alert('Please enter both name and description.');
      return;
    }

    try {
      const response = await axios.post(
        `${server}/api/projects`,
        newCard,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const updatedCards = [...cards];
      updatedCards[index] = response.data;
      setCards(updatedCards);
      setEditableCard(null);
    } catch (error) {
      console.error('Error creating new project:', error);
    }
  };

  const handleRenameCard = (index) => {
    setRenameIndex(index);
    setRenameDialogVisible(true);
    setRenameInputValue(cards[index].name);
  };

  const handleRenameInputChange = (event) => {
    setRenameInputValue(event.target.value);
  };

  const handleSaveRename = async () => {
    const updatedCards = [...cards];
    updatedCards[renameIndex].name = renameInputValue;

    try {
      const response = await axios.put(
        `${server}/api/projects/${updatedCards[renameIndex]._id}`,
        updatedCards[renameIndex],
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setCards(updatedCards);
      setRenameDialogVisible(false);
      setRenameIndex(null);
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`${server}/api/projects/${cardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDelete = (index) => {
    handleDeleteCard(cards[index]._id);
  };

  const handleEditClick = (index) => {
    setShowTooltipIndex(index);
  };

  const handleTitleChange = (event, index) => {
    const updatedCards = [...cards];
    updatedCards[index].name = event.target.value;
    setCards(updatedCards);
  };

  const handleDescriptionChange = (event, index) => {
    const updatedCards = [...cards];
    updatedCards[index].description = event.target.value;
    setCards(updatedCards);
  };

  const handleSaveChanges = async (index) => {
    const updatedCard = cards[index];

    try {
      await axios.put(
        `${server}/api/projects/${updatedCard._id}`,
        updatedCard,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setEditableCard(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  return (
    <div className="min-h-screen p-8  overflow:hidden">
      {/* <div className="flex justify-between items-center mb-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded-full flex justify-center items-center hover:bg-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" />
          Invite Members
        </button>
        <button
          className="border border-blue-500 text-blue-500 py-2 px-4 rounded-full flex items-center hover:bg-blue-500 hover:text-white"
          onClick={handleAddCard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11 9V5a1 1 0 0 0-2 0v4H5a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4 h4a1 1 0 1 0 0-2h-4z" clipRule="evenodd" />
          </svg>
          Create New Project
        </button>
      </div> */}
      <div className="flex flex-wrap">
        {cards.map((card, index) => (
          <div
            key={card._id}
            className="relative bg-white rounded-3xl shadow-xl p-6 m-4 w-64 cursor-pointer"
            onClick={() => handleCardClick(card._id)} // Ensure this onClick triggers the function
          >
            {editableCard === card._id ? (
              <>
                <input
                  type="text"
                  placeholder="Project name"
                  value={card.name}
                  onChange={(event) => handleTitleChange(event, index)}
                  className="w-full text-lg font-bold mb-2"
                  
                />
                <textarea
                  placeholder="Project description"
                  value={card.description}
                  onChange={(event) => handleDescriptionChange(event, index)}
                  className="w-full mb-2"
                />
                <button
                  onClick={() => handleSaveNewCard(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2">
                  {card.name}
                </h2>
                <p>{card.description}</p>
                <div className="absolute top-0 right-0 p-2">
                  {/* <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      handleEditClick(index);
                    }}
                  >
                    &#x2022;&#x2022;&#x2022;
                  </button> */}
                  {showTooltipIndex === index && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-3xl shadow-lg"
                      ref={menuRef}
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 rounded-3xl hover:bg-gray-100"
                        onClick={() => handleRenameCard(index)}
                      >
                        Rename
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-red-500 rounded-3xl hover:bg-gray-100"
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Rename Project</h2>
            <input
              type="text"
              value={renameInputValue}
              onChange={handleRenameInputChange}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
            />
            <button
              onClick={handleSaveRename}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setRenameDialogVisible(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;