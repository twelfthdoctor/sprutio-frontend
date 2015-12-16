// Generated by CoffeeScript 1.9.3
Ext.define('FM.action.Move', {
  extend: 'FM.overrides.Action',
  config: {
    iconCls: "fm-action-move",
    text: t("Move"),
    buttonText: t("Move [ Shift + 5 ]"),
    handler: function(panel, target_panel, records) {
      var paths, question, session, target_session;
      FM.Logger.info('Run Action FM.action.Move', arguments);
      if ((records == null) || records.length === 0) {
        FM.helpers.ShowError(t("Please select file entry."));
        return;
      }
      session = Ext.ux.Util.clone(panel.session);
      target_session = Ext.ux.Util.clone(target_panel.session);
      paths = FM.helpers.GetAbsNames(session, records);
      question = Ext.create('FM.view.windows.QuestionWindow', {
        title: t("Move"),
        msg: Ext.util.Format.format(t("Move {0} items to {1}?"), paths.length, target_session.path),
        yes: function() {
          var file_path, file_paths, i, len, same_session;
          file_paths = FM.helpers.GetAbsNames(session, records);
          same_session = FM.helpers.IsSameSession(session, target_session);
          for (i = 0, len = file_paths.length; i < len; i++) {
            file_path = file_paths[i];
            if (target_session.path.indexOf(file_path, 0) !== -1 && same_session) {
              FM.helpers.ShowError(t("Cannot move folder in its subfolder"));
              return;
            }
          }
          return FM.helpers.CheckOverwrite(target_panel, records, function(overwrite) {
            var wait;
            FM.Logger.debug('yes handler()', arguments);
            wait = Ext.create('FM.view.windows.ProgressWindow', {
              cancelable: true,
              msg: t("File moving, please wait..."),
              cancel: function(wait_window, session, status) {
                if (status != null) {
                  return FM.Actions.Move.cancel(wait_window, session, target_session, status);
                }
              }
            });
            wait.setSession(session);
            wait.setTargetSession(target_session);
            return FM.Actions.Move.process(wait, session, target_session, paths, overwrite);
          });
        }
      });
      return question.show();
    }
  },
  process: function(progress_window, session, target_session, paths, overwrite, status) {
    FM.Logger.debug('FM.action.Move process() called = ', arguments);
    if (status != null) {
      if ((status.status != null) && (status.status === FM.Status.STATUS_RUNNING || status.status === FM.Status.STATUS_WAIT)) {
        return setTimeout((function(_this) {
          return function() {
            return FM.backend.ajaxSend('/actions/main/check_status', {
              params: {
                session: session,
                status: status
              },
              success: function(response) {
                var percent, text;
                status = Ext.util.JSON.decode(response.responseText).data;
                if ((status.progress != null) && ((status.progress.text != null) || (status.progress.percent != null))) {
                  text = status.progress.text != null ? status.progress.text : '';
                  percent = status.progress.percent != null ? status.progress.percent : 0;
                  progress_window.updateProgress(percent, text);
                } else {
                  progress_window.updateProgressText(t("Moving files..."));
                }
                return _this.process(progress_window, session, target_session, paths, overwrite, status);
              },
              failure: function(response) {
                FM.helpers.ShowError(t("Error during check operation status.<br/>Please contact Support."));
                return FM.Logger.error(response);
              }
            });
          };
        })(this), FM.Time.REQUEST_DELAY);
      } else {
        return FM.getApplication().fireEvent(FM.Events.file.moveFiles, status, session, target_session, progress_window);
      }
    } else {
      if (session.type === FM.Session.LOCAL_APPLET) {
        try {
          progress_window.show();
          return FM.Active.applet.move(paths, session, target_session, overwrite, progress_window);
        } catch (_error) {
          FM.Logger.error("Applet error");
          return FM.helpers.ShowError(t("Error during operation. Please contact Support."));
        }
      } else {
        return FM.backend.ajaxSend('/actions/files/move', {
          params: {
            session: session,
            target: target_session,
            paths: paths,
            overwrite: overwrite
          },
          success: (function(_this) {
            return function(response) {
              status = Ext.util.JSON.decode(response.responseText).data;
              progress_window.setOperationStatus(status);
              progress_window.show();
              return _this.process(progress_window, session, target_session, paths, overwrite, status);
            };
          })(this),
          failure: (function(_this) {
            return function(response) {
              FM.helpers.ShowError(t("Error during move operation start. Please contact Support."));
              return FM.Logger.error(response);
            };
          })(this)
        });
      }
    }
  },
  cancel: function(progress_window, session, target_session, status) {
    return FM.backend.ajaxSend('/actions/main/cancel_operation', {
      params: {
        session: session,
        status: status
      },
      success: (function(_this) {
        return function(response) {
          var response_data;
          response_data = Ext.util.JSON.decode(response.responseText).data;
          FM.Logger.info(response_data);
          return progress_window.close();
        };
      })(this),
      failure: (function(_this) {
        return function(response) {
          progress_window.close();
          FM.helpers.ShowError(t("Error during move operation aborting. Please contact Support."));
          return FM.Logger.error(response);
        };
      })(this)
    });
  }
});