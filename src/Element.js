import React from 'react';
import ReactFireComponent from './ReactFireComponent';
import './Element.css';
import ElementMetaData from './ElementMetaData';
import Keyboard from './Keyboard';
import makeRows from './makeRows';

class Element extends ReactFireComponent {
  componentDidMount() {
    let component = this;
    let catchParentInteractions = ()=>{
      return (component.props.focused || component.depth() === 0) && !component.focusedChild();
    }
    let catchChildInteractions = ()=>{
      return component.props.parentFocused && !component.props.focused;
    }

    //  Drag and drop into other elements
    let dragging = false;
    let draggable = true;

    this.refs.label.addEventListener('hold', (event)=>{
      event.stopPropagation();
      draggable = false;
      //  TODO: create title editor
      component.props.setPanel('left', <ElementMetaData key={component.props.url} url={component.props.url}/>);

    });

    this.refs.label.addEventListener('drop', (event)=>{
      event.stopPropagation();
      draggable = true;
    });

    this.refs.root.addEventListener('hold', (event)=>{
      if (catchParentInteractions()) {
        let index = component.indexFromXY(event.x, event.y);
        component.dbref.push({
          index : index,
          importance : 1
         });
      }
    });

    this.refs.root.addEventListener('tap', (event)=>{
      if (catchChildInteractions()) {
        component.props.focus(); //  will focus on this one in the context of the parent
      }
    });

    this.refs.label.addEventListener('dragone', (event)=>{
      if (catchChildInteractions() && draggable) {
        event.preventDefault();
        dragging = true;
        component.refs.root.style.transform = 'translate(' + event.tx + 'px,'+ event.ty + 'px)';
        component.refs.root.style.zIndex = 10;
        component.refs.root.classList.add('Dragging');
      }
    });

    this.refs.label.addEventListener("drop", (event)=>{
      if (dragging) {
        let oldbbox = component.refs.root.getBoundingClientRect();
        let targetX = oldbbox.left;
        let targetY = oldbbox.top;
        dragging = false;
        //  need 2 animation frames for css to catch up for transition...
        let index = component.props.parentIndexFromXY(event.x, event.y);
        //  update the parent's stored index for this item
        component.props.setParentIndex(index);

        requestAnimationFrame(()=>{
          component.refs.root.style.display = 'hidden'; //  helps to not freak out the rendering loop
          component.refs.root.style.transform = 'translate(0px,0px)';
          component.refs.root.style.display = null;
          let bbox = component.refs.root.getBoundingClientRect();
          component.refs.root.style.transform = 'translate('+(targetX-bbox.left)+'px,'+(targetY-bbox.top)+'px)';
          requestAnimationFrame(()=>{
            component.refs.root.classList.remove('Dragging');
            requestAnimationFrame(()=>{
              component.refs.root.style.zIndex = 1;
              component.refs.root.style.transform = 'translate(0px,0px)';
            })
          });
        });

        //  TODO: high velocity off edge should trigger remove too
        if (event.x > window.innerWidth
        ||  event.y > window.innerHeight
        ||  event.x < 0
        ||  event.y < 0) {
          component.props.remove();
        }
      }
    });

    Keyboard.onPress('.', (event)=>{
      if (catchParentInteractions()) {
        if (event.pressed === 8 && component.props.unfocus) {
          requestAnimationFrame(()=>{
            component.props.unfocus();
          });
        }
      }
    });
  }
  depth() {
    return this.props.depth || 0;
  }
  getVisibleChildren() {
    let children = [];
    if (this.state) {
      Object
        .keys(this.state)
        .map((key)=>{
          //  collect all children that can be sorted for display
          //  must have index and importance defined to show
          if (!isNaN(this.state[key].index)
          &&  !isNaN(this.state[key].importance)) {
            //  store the childs key in the key field
            this.state[key].key = key;
            children.push(this.state[key]);
          }
          return null;
        });
    }
    children.sort((a,b)=>{
      return a.index - b.index;
    });


    //  filter removed children;
    children = children.filter((child)=>{
      return !child.removed;
    });
    return children;
  }
  indexFromXY(x,y) {
    let component = this;
    let children = this.getVisibleChildren();

    let currentIndex;
    Array.from(component.refs.root.children).filter((child)=>{
      return child.classList.contains('ElementChild');
    }).forEach((childElement, index)=>{
      let bbox = childElement.getBoundingClientRect();
      if (bbox.left+bbox.width/2 > x && bbox.top+bbox.height > y && currentIndex === undefined) {
        if (index === 0) {
          currentIndex = children[index].index-1;
        }
        else {
          currentIndex = (children[index].index+children[index-1].index)/2;
        }
      }
      //  if off to the right of previous row
      //  place before this one
      else if (bbox.top > y && currentIndex === undefined) {
        if (index === 0) {
          currentIndex = children[index].index-1;
        }
        else {
          currentIndex = (children[index].index+children[index-1].index)/2;
        }
      }
    });
    if (currentIndex === undefined) {
      if (children.length) {
        currentIndex = children[children.length-1].index + 1;
      }
      else {
        currentIndex = 1;
      }
    }
    return currentIndex;
  }
  focus(key) {
    //  parent marking child key as viewed
    let viewersUpdate = {};
    viewersUpdate[this.user().uid] = key;
    this.dbref.update({'viewers' : viewersUpdate});
  }
  focusedChild() {
    if (this.state && this.state.viewers) {
      return this.state.viewers[this.user().uid];
    }
  }
  render() {
    let component = this;
    let isRoot = this.depth() === 0; //  can get rid of most of this with relative depth...
                                     //  relative depth would require more parent coordination than necessary for now...
    let children = this.getVisibleChildren();
    let elementChildren = [];
    //  get the child that the current user is focused on
    let focusedChild = this.focusedChild();
    let currentComponentIsFocused = component.props.focused || isRoot;


    makeRows(children).map((row, rowIndex)=>{
      elementChildren.push(<div className="ElementChildRowDivider" key={rowIndex}></div>);
      row.columns.map((column, columnIndex)=>{
        let style = {
          flexGrow : column.importance,
          height : row.height
        };
        let childClasses = "ElementChild";
        if (columnIndex === 0) {
          childClasses += " FirstInRow";
        }
        if (focusedChild && column.key !== focusedChild) {
          childClasses += " AncestorChild";
          style.height = 0; //  TODO: if focused row, go to 100% height
          style.flexGrow = 0;
        }
        else if (focusedChild === column.key) {
          childClasses += " FocusedChild";
          style.height = '100%';
          style.flexGrow = 1;
        }
        let remove = ()=>{
          //  remove only ever executed in parent
          //  since no need to delete data immediately
          let update = {};
          update[column.key] = {
            removed : Date.now()
          };
          console.log(component.dbref);
          component.dbref.update(update);
        };

        elementChildren.push(<div className={childClasses} key={column.key} style={style}>
          <Element
            url={column.key}
            depth={component.depth()+1}
            key={column.key}
            remove={remove}
            parentIndexFromXY={(x,y)=>{
              return component.indexFromXY(x,y);
            }}
            focus={()=>{
              component.focus(column.key);
            }}
            unfocus={()=>{
              component.focus('');
            }}
            focused={column.key === focusedChild}
            parentFocused={currentComponentIsFocused}
            parentChildFocused={!!focusedChild}
            setParentIndex={(index)=>{
              //  update a columns index
              let update = {};
              //  TODO update only index...
              update[column.key] = {
                index : index,
                importance : column.importance
              };
              component.dbref.update(update);
            }}
            setPanel={component.props.setPanel}/>
        </div>);
        return null;
      });
      return null;
    });
    elementChildren.push(<div className="ElementChildRowDivider" key={elementChildren.length}></div>);
    let elementClasses = ["Element"];
    if (children.length === 0) {
      elementClasses.push("NoChildren");
    }
    if (this.depth() === 0) {
      elementClasses.push("Root");
    }

    let labelClasses="ElementChildLabel"
    if (component.props.parentFocused && !component.props.focused && !component.props.parentChildFocused) {
      elementClasses.push("NextLevel");
    }
    return (
      <div className={elementClasses.join(" ")} ref="root">
        {elementChildren}
        <div className={labelClasses}>
          <div className="Label" ref="label">{this.state? this.state.title || "..." : "..."}</div>
          </div>
      </div>
    );
  }
}

export default Element;