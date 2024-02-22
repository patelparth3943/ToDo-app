import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import ConfirmDelete from '@/components/ConfirmDelete';


import React, { Component, createRef } from 'react';

export default class extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    todoList: [],
    filterType: 'all',
  };

  inputRef = createRef();

  async componentDidMount() {
    try {
      const res = await fetch('http://localhost:3000/todoList');
      const json = await res.json();
      this.setState({ todoList: json })
    } catch (error) {

    }
  }

  addTodo = async event => {
    try {
      event.preventDefault();
      const inputText = this.inputRef.current;

      const res = await fetch('http://localhost:3000/todoList', {
        method: "POST",
        body: JSON.stringify({
          text: inputText.value,
          isDone: false,
        }),
        headers: {
          'Content-Type': 'application.json',
          Accept: 'application.json'
        }
      });
      const json = await res.json();

      this.setState(
        ({ todoList }) => ({
          todoList: [
            ...todoList, json],
        }),
        () => {
          inputText.value = '';
        },
      );
    } catch (error) { }
  };


  toggleComplete = async item => {
    try {
      const res = await fetch(`http://localhost:3000/todoList/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...item,
          isDone: !item.isDone,
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const json = await res.json();

      this.setState(({ todoList }) => {
        const index = todoList.findIndex(x => x.id === item.id);
        return {
          todoList: [
            ...todoList.slice(0, index),
            json,
            ...todoList.slice(index + 1),
          ],
        };
      });
    } catch (error) { }
  };

  deleteTodo = async item => {
    try {
      await fetch(`http://localhost:3000/todoList/${item.id}`, {
        method: 'DELETE',
      });

      this.setState(({ todoList }) => {
        const index = todoList.findIndex(x => x.id === item.id);
        return {
          todoList: [...todoList.slice(0, index), ...todoList.slice(index + 1)],
        };
      });
    } catch (error) { }
  };

  changeFilterType = filterType => {
    this.setState({ filterType });
  };

  render() {
    // console.log('render');
    const { todoList, filterType } = this.state
    return (
      <div className="flex min-h-screen flex-col items-center gap-8 pt-5">
        <h1 className="text-center text-3xl font-bold">Todo App</h1>
        <form className="flex" onSubmit={this.addTodo}>
          <Input ref={this.inputRef} required className="rounded-r-none" />
          <Button type="submit" className="rounded-l-none">Button</Button>
        </form>
        <div className="flex flex-col gap-6 w-full p-6 flex-1">
          {todoList.map(x => {
            if (
              filterType === 'all' ||
              (filterType === 'pending' && x.isDone === false) ||
              (filterType === 'completed' && x.isDone === true)
            ) {
              return (
                <div key={x.id} className="flex items-center">
                  <Checkbox
                    checked={x.isDone}
                    onCheckedChange={() => this.toggleComplete(x)}
                  />
                  <p
                    className={`flex-1 px-4${x.isDone ? ' line-through' : ''}`}
                  >
                    {x.text}
                  </p>
                  <ConfirmDelete onClick={() => this.deleteTodo(x)} />
                </div>
              );
            }
            return null;
          })}

        </div>

        <div className="flex w-full">
          <Button
            className="flex-1 rounded-none"
            variant={filterType === 'all' ? 'destructive' : 'default'}
            onClick={() => this.changeFilterType('all')}
          >
            All
          </Button>
          <Button
            className="flex-1 rounded-none"
            variant={filterType === 'pending' ? 'destructive' : 'default'}
            onClick={() => this.changeFilterType('pending')}
          >
            Pending
          </Button>
          <Button
            className="flex-1 rounded-none"
            variant={filterType === 'completed' ? 'destructive' : 'default'}
            onClick={() => this.changeFilterType('completed')}
          >
            Completed
          </Button>
        </div>
      </div>
    );
  }
}
