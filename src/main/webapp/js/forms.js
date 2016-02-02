'use strict';

var Forms = (function() {
	return {
		Autocomplete : function(input, list, item_provider, item_drawer, validation_callback, selection_callback, update_callback) {
			var selection; //currently selected item
			var candidates; //current candidate items

			//close results on a click outside
			document.addEventListener('click', function(event) {
				if(!list.contains(event.target) && !input.contains(event.target)) {
					list.style.display = 'none';
				}
			});

			function unselect_all() {
				selection = undefined;
				list.querySelectorAll('li').forEach(function(item) {
					item.classList.remove('selected');
				});
			}

			function manage_mouse_over() {
				unselect_all();
				selection = this.item;
				this.classList.add('selected');
			}

			function manage_mouse_out() {
				unselect_all();
				this.classList.remove('selected');
			}

			function manage_mouse_click() {
				list.style.display = 'none';
				input.value = '';
				if(validation_callback) {
					validation_callback.call(undefined, this.item);
				}
			}

			function manage_keys(event) {
				//enter
				if(event.keyCode === 13 && validation_callback) {
					list.style.display = 'none';
					input.value = '';
					if(validation_callback) {
						validation_callback.call(undefined, selection);
					}
					return;
				}
				//escape
				if(event.keyCode === 27) {
					selection = undefined;
					list.style.display = 'none';
					return;
				}
				//down or up
				if(event.keyCode === 40 || event.keyCode === 38) {
					//going down
					if(event.keyCode === 40) {
						//initialize selection on the top candidate
						if(!selection || selection === candidates.last()) {
							selection = candidates[0];
						}
						//normal case, select the next result_nodes
						else {
							selection = candidates[candidates.indexOf(selection) + 1];
						}
					}
					//going up
					else {
						//initialize selection on bottom result_nodes
						if(!selection || selection === candidates.first()) {
							selection = candidates.last();
						}
						//normal case, select the previous result_nodes
						else {
							selection = candidates[candidates.indexOf(selection) - 1];
						}
					}
					//update results list
					list.querySelectorAll('li').forEach(function(item) {
						if(item.item === selection) {
							item.classList.add('selected');
						}
						else {
							item.classList.remove('selected');
						}
					});
					//selection callback
					if(selection_callback) {
						selection_callback.call(undefined, selection);
					}
				}
			}

			function manage_update(event) {
				var value = this.value;

				//update callback
				if(update_callback) {
					update_callback.call(undefined, value);
				}

				//reset candidates and selection
				candidates = [];
				selection = undefined;

				//stop listening keyboard
				document.removeEventListener('keyup', manage_keys);

				//update list
				list.clear();
				list.style.display = 'none';

				if(value) {
					//search item, filter them if needed and take only first 10 results
					candidates = item_provider(value);
					if(candidates.length > 0) {
						candidates.map(function(candidate) {
							var item_ui = item_drawer(candidate, value);
							//enhance element
							item_ui.item = candidate;
							item_ui.addEventListener('mouseout', manage_mouse_out);
							item_ui.addEventListener('mouseover', manage_mouse_over);
							item_ui.addEventListener('click', manage_mouse_click);
							return item_ui;
						}).forEach(Node.prototype.appendChild, list);

						list.style.display = 'block';
						//listen keyboard in order to let user navigate trough results
						document.addEventListener('keyup', manage_keys);
					}
				}
			}

			//add listeners to show search results as user type
			input.addEventListener('input', manage_update);
			//add listener on change to manage search when input content is cut or paste
			//input.addEventListener('change', manage_update);
		}
	};
})();
