var ChainedSelects = Class.create();
ChainedSelects.prototype = {
  initialize: function(tree, form, selectNames, active, oncomplete) {
    this.tree = tree;
    this.names = selectNames.map(function(select) {
      return select.size == undefined ? select : select[1]; // enumerable: [id, name]
    });
    this.active = active;
    this.oncomplete = oncomplete;
    this.defaults = [];
    this.selection = [];
    this.selects = selectNames.map(function(select) {
      return select.size == undefined ? $(form)[select] : $(form)[select[0]]; // enumerable: [id, name]
    });
    this.populateSelect(0);
  },
  populateSelect: function(size) {
    // get our information for our select
    selected = false;
    name = this.names[size];
    tree = size == 0 ? this.tree : this.selection.inject(this.tree, function(tree, value) { 
      return tree[value];
    });

    // move any active selection / remember it in defaults
    active = this.active.shift();
    this.defaults.push(active);
		
    // determine our options
		selectedIndex = index = 0;
    options = [new Option("Choose "+name+"...",'choose')];
    for(i in tree) {			
			++index; 
      value = (size+1 == this.selects.size()) ? tree[i] : i;
      options.push(new Option(i, value));
      if(active == i) { 
				selected = value;
				selectedIndex = index;
			}
    }

    // build our selects
    select=this.selects[size];
    select.options.length = 0;
    for(i=0; i<options.size(); i++) {
      select.options[i] = options[i];
    }
		select.selectedIndex = selectedIndex; 
    select.disabled = false;    
    this.chainSelect(size,select)

    // if we have any active
    if(selected && size < this.selects.size()-1) {
      this.selection.push(selected);
      this.populateSelect(size+1);
    }

    // do we need to call the oncomplete function?
    this.doOnComplete();
  },
  manageSelects: function(level,value) {
    // remove any levels above ours
    size = this.selection.size();
    if(size != level) {
      for(i=size;i>level;i--) {
        this.selection.pop();
        this.selects[i].options.length = 0;
        this.selects[i].disabled = true;
      }
    }
    // build the next level up if a choice
    if(value != 'choose' && level < this.selects.size()-1) {
      size = this.selection.size() + 1;
      this.selection.push(value);
      this.populateSelect(size)
    }
    this.doOnComplete();
  },
  chainSelect: function(level,select) {
    chain = this; // needed for closure
    Event.observe(select, 'change', function(e) {
      chain.manageSelects(level,Form.Element.getValue(e.target));
    });
  },
  doOnComplete: function() {
    var sel = this.selects[this.selects.size()-1]
    if (this.oncomplete && !sel.disabled && sel.value != 'choose') {
      this.oncomplete(sel.value);
    }
  }
};
