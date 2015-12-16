// Generated by CoffeeScript 1.9.3
Ext.define('FM.view.windows.ImageViewer', {
  extend: 'Ext.ux.window.Window',
  requires: ['ImageViewer'],
  alias: 'widget.image-viewer',
  title: t("Image Viewer"),
  cls: 'fm-image-viewer-window',
  animate: true,
  constrain: true,
  layout: 'fit',
  bodyPadding: '0 0 20 0',
  width: 400,
  height: 300,
  resizable: {
    minHeight: 300,
    maxHeight: 900,
    pinned: true
  },
  maximizable: true,
  modal: false,
  border: false,
  first: false,
  listeners: {
    resize: {
      fn: function() {
        return setTimeout((function(_this) {
          return function() {
            FM.Logger.debug('FM.view.windows.ImageViewer resize() event called', arguments);
            return _this.viewer.stretchOptimally();
          };
        })(this), 200);
      }
    },
    show: {
      fn: function() {
        var image, win;
        FM.Logger.debug('FM.view.windows.ImageViewer show() event called', arguments);
        if (this.keymap != null) {
          this.keymap.destroy();
        }
        this.keymap = new Ext.util.KeyMap({
          target: this.getEl(),
          binding: []
        });
        image = this.viewer.query('image')[0];
        win = this;
        return image.el.dom.onload = function() {
          var current_height, current_width, h, h2, viewer, w, w2;
          if (win.first === false) {
            FM.Logger.debug("Image DOM ", image, ' w x h', image.el.dom.naturalWidth, image.el.dom.naturalHeight);
            w = image.el.dom.naturalWidth;
            h = image.el.dom.naturalHeight;
            current_width = win.image_min_width;
            if (w >= win.image_min_width && w <= win.image_max_width) {
              current_width = w;
            } else if (w >= win.image_max_width) {
              current_width = win.image_max_width;
            } else {
              current_width = w;
            }
            current_height = current_width * h / w;
            w2 = current_width + 12;
            h2 = current_height + 60;
            w2 = w2 < 200 ? 200 : w2;
            h2 = h2 < 200 ? 200 : h2;
            win.setWidth(w2);
            win.setHeight(h2);
            FM.Logger.debug("Adjusted size w2 x h2 ", w2, h2, " window size w x h ", win.getWidth(), win.getHeight());
            viewer = win.viewer;
            viewer.setRotation(0);
            viewer.rotateImage();
            viewer.setOriginalImageWidth(image.el.dom.width);
            viewer.setOriginalImageHeight(image.el.dom.height);
            viewer.setImageWidth(image.el.dom.width);
            viewer.setImageHeight(image.el.dom.height);
            viewer.stretchOptimally();
            win.center();
            return win.first = true;
          }
        };
      }
    }
  },
  initComponent: function() {
    var i, image, images_src, index, j, len, ref;
    FM.Logger.debug('FM.view.windows.ImageViewer initComponent() called', arguments);
    this.image_min_width = 400;
    this.image_min_height = 300;
    this.image_max_width = 800;
    this.image_max_height = 600;
    index = 0;
    images_src = [];
    ref = this.imageRecords;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      image = ref[i];
      if (this.imageCurrent.get('src') === image.get('src')) {
        index = i;
      }
      images_src.push(image.get('src'));
    }
    this.viewer = Ext.create('ImageViewer', {
      itemId: 'imageviwer',
      src: this.imageCurrent.get('src'),
      current_index: index,
      images: images_src
    });
    this.items = [this.viewer];
    return this.callParent(arguments);
  },
  setSession: function(session) {
    return this.session = session;
  },
  getSession: function() {
    return this.session;
  },
  hasSession: function() {
    if (this.session != null) {
      return true;
    } else {
      return false;
    }
  },
  exit: function() {
    FM.Logger.debug('FM.view.windows.ViewerWindow exit() called', arguments);
    return this.close();
  },
  changeSyntax: function(syntax) {
    FM.Logger.debug('FM.view.windows.ViewerWindow changeSyntax() called', arguments);
    this.viewerMode = syntax;
    this.updateToolbar();
    return this.updateSettings();
  },
  initEditor: function(ace_editor) {
    var all, loaded, percent;
    FM.Logger.debug('FM.view.windows.ViewerWindow initEditor() called', arguments);
    this.editor = ace_editor;
    this.editor.setReadOnly(true);
    this.editor_mode = Ext.ComponentQuery.query('tbtext[cls=fm-viewer-mode]', this)[0];
    this.editor_encoding = Ext.ComponentQuery.query('tbtext[cls=fm-viewer-encoding]', this)[0];
    this.editor_size = Ext.ComponentQuery.query('tbtext[cls=fm-viewer-size]', this)[0];
    this.editor_status = Ext.ComponentQuery.query('tbtext[cls=fm-viewer-status]', this)[0];
    this.editor_position = Ext.ComponentQuery.query('tbtext[cls=fm-viewer-position]', this)[0];
    this.editor_mode.setText(Ext.util.Format.format(t("Mode: {0}"), this.viewerMode));
    this.editor_encoding.setText(this.fileEncoding);
    all = this.fileRecord.get("size");
    loaded = this.fileRecord.get("size");
    percent = (loaded / all).toFixed(2) * 100;
    this.editor_size.setText(Ext.util.Format.format(t("Loaded {0}% : {1} of {2} bytes"), percent, loaded, all));
    return this.editor.selection.on("changeCursor", (function(_this) {
      return function() {
        var c;
        c = _this.editor.selection.getCursor();
        return _this.editor_position.setText((c.row + 1) + " : " + c.column);
      };
    })(this));
  },
  updateToolbar: function() {
    var all, c, loaded, percent, syntax_menu;
    FM.Logger.debug('FM.view.windows.EditorWindow updateToolbar() called', arguments);
    this.editor_mode.setText(Ext.util.Format.format(t("Mode: {0}"), this.viewerMode));
    this.editor_encoding.setText(this.fileEncoding);
    all = this.fileRecord.get("size");
    loaded = this.fileRecord.get("size");
    percent = (loaded / all).toFixed(2) * 100;
    this.editor_size.setText(Ext.util.Format.format(t("Loaded {0}% : {1} of {2} bytes"), percent, loaded, all));
    c = this.editor.selection.getCursor();
    this.editor_position.setText((c.row + 1) + " : " + c.column);
    syntax_menu = Ext.ComponentQuery.query('button[cls=button-menu-syntax]', this)[0].getMenu();
    return syntax_menu.items.each(function(item) {
      if (item.text !== this.viewerMode) {
        return item.setChecked(false);
      } else {
        return item.setChecked(true);
      }
    }, this);
  },
  updateSettings: function() {
    FM.helpers.SetLoading(this.body, t("Applying settings..."));
    this.editor.setPrintMarginColumn(FM.Viewer.settings.print_margin_size);
    this.editor.setFontSize(FM.Viewer.settings.font_size + "px");
    this.editor.getSession().setTabSize(FM.Viewer.settings.tab_size);
    this.editor.setSelectionStyle(FM.Viewer.settings.full_line_selection ? "line" : "text");
    this.editor.setHighlightActiveLine(FM.Viewer.settings.highlight_active_line);
    this.editor.setShowInvisibles(FM.Viewer.settings.show_invisible);
    this.editor.getSession().setUseWrapMode(FM.Viewer.settings.wrap_lines);
    this.editor.getSession().setUseSoftTabs(FM.Viewer.settings.use_soft_tabs);
    this.editor.renderer.setShowGutter(FM.Viewer.settings.show_line_numbers);
    this.editor.setHighlightSelectedWord(FM.Viewer.settings.highlight_selected_word);
    this.editor.renderer.setShowPrintMargin(FM.Viewer.settings.show_print_margin);
    this.editor.getSession().setFoldStyle(FM.Viewer.settings.code_folding_type);
    this.editor.setTheme("ace/theme/" + FM.Viewer.settings.theme);
    this.editor.getSession().setMode("ace/mode/" + this.viewerMode);
    return FM.helpers.UnsetLoading(this.body);
  }
});