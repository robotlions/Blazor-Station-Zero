var _isDraggingTrash = false;
var _folderDrag = {};

export function registerFolderDrag(dotNetRef) {
	unregisterFolderDrag();

	var _folderDeletedByTrash = false;
	var _textFileDeletedByTrash = false;
	var _textFileDroppedInFolder = false;
	var _isDraggingFolder = false;

	function attachFolderHandlers() {
		var folder = document.getElementById('folder');
		if (!folder) return null;

		var folderOffsetX = 0, folderOffsetY = 0;
		var desktopEl = document.querySelector('.desktop-area');

		var onDragStart = function (e) {
			if (e.dataTransfer) e.dataTransfer.setData('text/plain', 'folder');
			folder.classList.add('dragging');
			_folderDeletedByTrash = false;
			_isDraggingFolder = true;
			var rect = folder.getBoundingClientRect();
			folderOffsetX = e.clientX - rect.left;
			folderOffsetY = e.clientY - rect.top;
		};
		var onDragEnd = function (e) {
			folder.classList.remove('dragging');
			_isDraggingFolder = false;
			if (_folderDeletedByTrash) return;
			var dr = desktopEl ? desktopEl.getBoundingClientRect() : null;
			var inside = dr && e.clientX >= dr.left && e.clientX <= dr.right && e.clientY >= dr.top && e.clientY <= dr.bottom;
			if (inside) {
				var newLeft = Math.max(0, Math.min(e.clientX - dr.left - folderOffsetX, dr.width - folder.offsetWidth));
				var newTop = Math.max(0, Math.min(e.clientY - dr.top - folderOffsetY, dr.height - folder.offsetHeight));
				folder.style.left = newLeft + 'px';
				folder.style.top = newTop + 'px';
				try { dotNetRef.invokeMethodAsync('OnFolderMoved', newLeft, newTop).catch(function () { }); } catch (e2) { }
			} else {
				folder.style.left = '12px';
				folder.style.top = '12px';
				try { dotNetRef.invokeMethodAsync('OnFolderMoved', 12, 12).catch(function () { }); } catch (e2) { }
			}
		};

		try { folder.removeEventListener('dragstart', onDragStart); } catch (e) { }
		try { folder.removeEventListener('dragend', onDragEnd); } catch (e) { }

		folder.addEventListener('dragstart', onDragStart);
		folder.addEventListener('dragend', onDragEnd);

		return { el: folder, onDragStart: onDragStart, onDragEnd: onDragEnd };
	}

	var folderHandlers = attachFolderHandlers();

	function attachTextFileHandlers() {
		var textFile = document.getElementById('text-file');
		if (!textFile) return null;

		var offsetX = 0, offsetY = 0;
		var desktopEl = document.querySelector('.desktop-area');

		var onDragStart = function (e) {
			if (e.dataTransfer) e.dataTransfer.setData('text/plain', 'text-file');
			textFile.classList.add('dragging');
			_textFileDeletedByTrash = false;
			_textFileDroppedInFolder = false;
			var rect = textFile.getBoundingClientRect();
			offsetX = e.clientX - rect.left;
			offsetY = e.clientY - rect.top;
		};
		var onDragEnd = function (e) {
			textFile.classList.remove('dragging');
			if (_textFileDeletedByTrash || _textFileDroppedInFolder) return;
			var dr = desktopEl ? desktopEl.getBoundingClientRect() : null;
			var inside = dr && e.clientX >= dr.left && e.clientX <= dr.right && e.clientY >= dr.top && e.clientY <= dr.bottom;
			if (inside) {
				var newLeft = Math.max(0, Math.min(e.clientX - dr.left - offsetX, dr.width - textFile.offsetWidth));
				var newTop = Math.max(0, Math.min(e.clientY - dr.top - offsetY, dr.height - textFile.offsetHeight));
				textFile.style.left = newLeft + 'px';
				textFile.style.top = newTop + 'px';
				try { dotNetRef.invokeMethodAsync('OnTextFileMoved', newLeft, newTop).catch(function () { }); } catch (e2) { }
			} else {
				textFile.style.left = '12px';
				textFile.style.top = '85px';
				try { dotNetRef.invokeMethodAsync('OnTextFileMoved', 100, 12).catch(function () { }); } catch (e2) { }
			}
		};

		try { textFile.removeEventListener('dragstart', onDragStart); } catch (e) { }
		try { textFile.removeEventListener('dragend', onDragEnd); } catch (e) { }
		textFile.addEventListener('dragstart', onDragStart);
		textFile.addEventListener('dragend', onDragEnd);

		return { el: textFile, onDragStart: onDragStart, onDragEnd: onDragEnd };
	}

	var textFileHandlers = attachTextFileHandlers();

	// register folder as drop target for text file only (not trash)
	var folderDropEl = document.getElementById('folder');
	var folderDropHandlers = null;
	if (folderDropEl) {
		var onFolderDragOver = function (ev) {
			if (_isDraggingFolder || _isDraggingTrash) return;
			ev.preventDefault();
			if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
			folderDropEl.classList.add('over');
		};
		var onFolderDragLeave = function (ev) { folderDropEl.classList.remove('over'); };
		var onFolderDrop = function (ev) {
			if (_isDraggingFolder || _isDraggingTrash) return;
			ev.preventDefault();
			folderDropEl.classList.remove('over');
			var dragType = ev.dataTransfer ? ev.dataTransfer.getData('text/plain') : '';
			if (dragType === 'text-file') {
				_textFileDroppedInFolder = true;
				try { dotNetRef.invokeMethodAsync('OnTextFileDroppedInFolder').catch(function () { }); } catch (e) { }
			}
		};
		folderDropEl.addEventListener('dragover', onFolderDragOver);
		folderDropEl.addEventListener('dragleave', onFolderDragLeave);
		folderDropEl.addEventListener('drop', onFolderDrop);
		folderDropHandlers = { el: folderDropEl, onDragOver: onFolderDragOver, onDragLeave: onFolderDragLeave, onDrop: onFolderDrop };
	}

	// desktop-area is the single valid drop zone
	var hotspots = [];
	var desktopDropEl = document.getElementById('desktop-area');
	if (desktopDropEl) {
		var onDesktopDragOver = function (ev) { ev.preventDefault(); if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'; };
		var onDesktopDragLeave = function () { };
		var onDesktopDrop = function (ev) { ev.preventDefault(); };
		desktopDropEl.addEventListener('dragover', onDesktopDragOver);
		desktopDropEl.addEventListener('drop', onDesktopDrop);
		hotspots.push({ el: desktopDropEl, onDragOver: onDesktopDragOver, onDragLeave: onDesktopDragLeave, onDrop: onDesktopDrop });
	}

	// register trash container as a drop target and drag source
	var trash = document.getElementById('trash-container');
	var trashDragHandlers = null;
	if (trash) {
		var onTrashDragOver = function (ev) { if (_isDraggingTrash) return; ev.preventDefault(); if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move'; this.classList.add('over'); };
		var onTrashLeave = function (ev) { this.classList.remove('over'); };
		var onTrashDrop = function (ev) {
			if (_isDraggingTrash) return;
			ev.preventDefault();
			this.classList.remove('over');
			var dragType = ev.dataTransfer ? ev.dataTransfer.getData('text/plain') : '';
			if (dragType === 'folder') {
				_folderDeletedByTrash = true;
				try { dotNetRef.invokeMethodAsync('OnFolderDeleted').catch(function () { }); } catch (e) { }
			} else if (dragType === 'text-file') {
				_textFileDeletedByTrash = true;
				try { dotNetRef.invokeMethodAsync('OnTextFileDeleted').catch(function () { }); } catch (e) { }
			}
		};

		trash.addEventListener('dragover', onTrashDragOver);
		trash.addEventListener('dragleave', onTrashLeave);
		trash.addEventListener('drop', onTrashDrop);
		hotspots.push({ el: trash, onDragOver: onTrashDragOver, onDragLeave: onTrashLeave, onDrop: onTrashDrop });

		// trash as drag source — repositions it within the desktop
		var trashOffsetX = 0, trashOffsetY = 0;
		var desktopEl = document.querySelector('.desktop-area');
		var onTrashDragStart = function (e) {
			_isDraggingTrash = true;
			trash.classList.add('dragging');
			var rect = trash.getBoundingClientRect();
			trashOffsetX = e.clientX - rect.left;
			trashOffsetY = e.clientY - rect.top;
			if (e.dataTransfer) { e.dataTransfer.setData('text/plain', 'trash'); e.dataTransfer.effectAllowed = 'move'; }
		};
		var onTrashDragEnd = function (e) {
			_isDraggingTrash = false;
			trash.classList.remove('dragging');
			if (desktopEl && e.clientX !== 0 && e.clientY !== 0) {
				var dr = desktopEl.getBoundingClientRect();
				var newLeft = Math.max(0, Math.min(e.clientX - dr.left - trashOffsetX, dr.width - trash.offsetWidth));
				var newTop = Math.max(0, Math.min(e.clientY - dr.top - trashOffsetY, dr.height - trash.offsetHeight));
				trash.style.right = 'auto';
				trash.style.bottom = 'auto';
				trash.style.left = newLeft + 'px';
				trash.style.top = newTop + 'px';
			}
		};
		trash.setAttribute('draggable', 'true');
		trash.addEventListener('dragstart', onTrashDragStart);
		trash.addEventListener('dragend', onTrashDragEnd);
		trashDragHandlers = { el: trash, onDragStart: onTrashDragStart, onDragEnd: onTrashDragEnd };
	}

	_folderDrag = { folderHandlers: folderHandlers, textFileHandlers: textFileHandlers, folderDropHandlers: folderDropHandlers, hotspots: hotspots, dotNetRef: dotNetRef, trashDragHandlers: trashDragHandlers };
}

export function unregisterFolderDrag() {
	var state = _folderDrag;
	if (!state) return;
	try {
		if (state.folderHandlers) {
			try { if (state.folderHandlers.el) state.folderHandlers.el.removeEventListener('dragstart', state.folderHandlers.onDragStart); } catch (e) { }
			try { if (state.folderHandlers.el) state.folderHandlers.el.removeEventListener('dragend', state.folderHandlers.onDragEnd); } catch (e) { }
		}
		if (state.hotspots) {
			state.hotspots.forEach(function (h) {
				h.el.removeEventListener('dragover', h.onDragOver);
				h.el.removeEventListener('dragleave', h.onDragLeave);
				h.el.removeEventListener('drop', h.onDrop);
			});
		}
		if (state.trashDragHandlers) {
			try { state.trashDragHandlers.el.removeEventListener('dragstart', state.trashDragHandlers.onDragStart); } catch (e) { }
			try { state.trashDragHandlers.el.removeEventListener('dragend', state.trashDragHandlers.onDragEnd); } catch (e) { }
		}
		if (state.textFileHandlers) {
			try { if (state.textFileHandlers.el) state.textFileHandlers.el.removeEventListener('dragstart', state.textFileHandlers.onDragStart); } catch (e) { }
			try { if (state.textFileHandlers.el) state.textFileHandlers.el.removeEventListener('dragend', state.textFileHandlers.onDragEnd); } catch (e) { }
		}
		if (state.folderDropHandlers) {
			try { state.folderDropHandlers.el.removeEventListener('dragover', state.folderDropHandlers.onDragOver); } catch (e) { }
			try { state.folderDropHandlers.el.removeEventListener('dragleave', state.folderDropHandlers.onDragLeave); } catch (e) { }
			try { state.folderDropHandlers.el.removeEventListener('drop', state.folderDropHandlers.onDrop); } catch (e) { }
		}
	} catch (e) { }
	_folderDrag = {};
}
