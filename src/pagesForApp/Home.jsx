import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const uniqueId = uuidv4();
  const inputRef = useRef(null);
  const [todo,setTodo] = useState("");
  const [todoArray,setTodoArray] = useState([]);
  const [updateButtonActive,setUpdateButtonActive] = useState(false);
  const [todoId,setTodoId] = useState(null);
  let userInfo;

    try {
      const userInfoUnparresed =localStorage.getItem("OnGraphTodoApp");
      console.log(userInfoUnparresed)
      console.log(1)
      if(userInfoUnparresed){
        console.log(2)
        userInfo = JSON.parse(userInfoUnparresed)
      }else{
          console.log(3)
        navigate("/login")
      }
      
    } catch (error) {
      console.log(error.message)
    }


  async function updateTodosFunc(){
    setUpdateButtonActive(false);
    setTodoId(null);
    const updateRequiredTodo = todoArray.find((todo)=>{
     return todo.id === todoId
    })
    const oneMinusTodoArray = todoArray.filter((todo)=>{
     return todo.id!==todoId
    })
    const todoArray2 = [...oneMinusTodoArray,{...updateRequiredTodo,todo:todo}]
    const currentDate = new Date();
    const sortedTodoArray = todoArray2.sort((a, b) => {
     const timeDifferenceA = Math.abs(currentDate - a.date);
     const timeDifferenceB = Math.abs(currentDate - b.date);
     return timeDifferenceB - timeDifferenceA;
   });
   const data = await axios.post('http://localhost:4500/updateTodo',{todoArray:sortedTodoArray,email:userInfo.email,password:userInfo.password,});
   if(data.data.status === 200){
     setTodoArray(sortedTodoArray);
     setTodo('');
    }else{
      console.log('err arrived')
    }
  }
  async function keyDownFunc(e){
    if(e.key === "Enter" || e.keyCode === 13){
      if(todo!=='' && updateButtonActive===false){
        const newTodoArray = [
          ...todoArray,
          {todo:todo,id:uniqueId,date:new Date()}
        ]
       setTodoArray(newTodoArray);
       const {data} = await axios.post("http://localhost:4500/add",{todoArray:newTodoArray,email:userInfo.email,password:userInfo.password})
       console.log(data)
       setTodo('')
      }else if(todo!=='' && updateButtonActive===true){
        updateTodosFunc();
      }
     }
  }
  async function cancelFunc(){
    setTodo("");
    setUpdateButtonActive(false);
    setTodoId(null);
  }
  async function addTodoFunc(){
   if(todo.length>1){
    const newTodoArray = [
      ...todoArray,
      {todo:todo,id:uniqueId ,date:new Date()}
    ]
    setTodoArray(newTodoArray)
    setTodo('');

    const {data} = await axios.post("http://localhost:4500/login",{todoArray:newTodoArray,email:userInfo.email,password:userInfo.password})
   }
  }
  function updateFunc(todoElement){
    setTodo(todoElement.todo)
    setUpdateButtonActive(true);
    setTodoId(todoElement.id)
    inputRef.current.focus();
  }
  async function removeFunc(todoElement){
    const newTodoArray = todoArray.filter((todo)=>{
      return todo.id !== todoElement.id
    })
    const data = await axios.post('http://localhost:4500/deleteTodo',{todoArray:newTodoArray,email:userInfo.email,password:userInfo.password,});
    if(data.data.status===200){
      setTodoArray(newTodoArray)
    }else{
      console.log('err arrived')
    }
  }

  useEffect(()=>{
    try {
      async function func(){
        const data = await axios.post('http://localhost:4500/getTodos',{email:userInfo?.email,password:userInfo?.password});
        console.log(data);
        if(data.data.todosArray){
          setTodoArray(data.data.todosArray)
        }else{
          navigate("/")
        }
      }
      func()
    } catch (error) {
      console.log(error.message)
    }
  },[])

  return (
    <Container>
      <div id='inputCont'>
      <input ref={inputRef} type="text" placeholder='Write you todo here' value={todo} onChange={(e)=>{setTodo(e.target.value)}}
      onKeyDown={(e)=>{keyDownFunc(e)}}
      />
    {
      updateButtonActive ? (<button onClick={updateTodosFunc}>Update</button>) : (<button type='submit' onClick={addTodoFunc}>Add</button>)
    }
      </div>
      <div id='todoList'>
           {
            todoArray.map((todoElement)=>{
               return(
                <div id='todoElement' key={todoElement.id} className={`${todoElement.id===todoId?"updateAskingTodo":""}`}>
                   <p>{todoElement.todo}</p>
                   <button onClick={()=>{removeFunc(todoElement)}}>Remove</button>
               {
                todoElement.id === todoId ? (<button onClick={cancelFunc}>Cancel</button>) : (<button onClick={()=>{updateFunc(todoElement)}}>Update</button>)
               }
                </div>
               )
            })
           }
           {
            todoArray.length < 1 ? (<h3>No todos made yet 😅</h3>) : ""
           }
      </div>
    </Container>
  )
}

const Container = styled.div`
height: 100vh;
width: 100vw;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 1rem;
background-color: #131324;
#inputCont{
  width: 40%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 1rem;
  @media only screen and (max-width: 1200px){
    flex-direction: column;
    width: 80%;
  }
  button{
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: 0.5s ease-in-out;
    &:hover{
      background-color: #4e0eff;
    }
  }
}
  input{
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1rem;
    transition: border 0.5s ease;
    &:focus{
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  #todoList{
  width: 40%;
  height: 60%;
  background-color: #6a6a87;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  @media only screen and (max-width: 1200px){
    width: 80%;
  }
  .updateAskingTodo{
    border-radius: 10px;
    background-color: grey;
  }
  &::-webkit-scrollbar {
          width: 0.2rem;
          &-thumb{
            background-color: white;
            width: 0.9rem;
            border-radius: 4rem;
          }
        }
  }
  p{
    width: 40%;
    text-align: center;
    color: white;
    background-color: #131324;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 30px; */
    word-break: break-word;
    padding: 0.5rem;

  }
  #todoElement{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    width: 80%;
    gap: 1rem;
    button{
    background-color: #997af0;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    transition: 0.5s ease-in-out;
    &:hover{
      background-color: #4e0eff;
    }
  }
  }
`