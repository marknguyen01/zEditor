var version = 'punbb'; // punbb or phpbb3 or invision
var lang = {
	reply: "Mode: Reply",
	edit: "Mode: Edit",
	quote: "Mode: Quote",
	preview: "Mode: Preview",
	loading: "Loading...",
	flood_message: "You cannot send 2 posts at the same. Please wait",
	error_message: "An unexpected error has occurred. Please refresh the page",
	notify_message: "Would you like to notify",
	reply_button: "Reply",
	preview_button: "Preview",
	close_button: "Close",
	bold_button: "Bold",
	italic_button: "Italic",
	strike_button: "Strike",
	underline_button: "Underline",
	color_button: "Color",
	smiley_button: "Smilies",
	tag_button: "Tag"
};
var editor;
var editor_mode;
var editor_post;
var editor_message;
var textarea;
var post_url;
var zeditor = {
	ready: function () {
		editor_post = '.post';
		if (version == 'punbb') {
			editor_message = '.zeditor-message';
			editor_preview = '.entry-content';
			editor_options = '.post-options'
		}
		if (version == 'phpbb3') {
			editor_preview = editor_message = '.content';
			editor_options = '.profile-icons'
		}
		if (version == 'invision') {
			editor_preview = editor_message = '.post-entry';
			editor_options = '.posting-icons'
		}
		textarea = document.getElementById('editor-textarea');
		qreply = document.getElementById('quick_reply');
		$('.h3:contains("Quick reply:")').remove();
		editor = document.getElementById('ze-editor-form');
		editor_mode = document.getElementById('editor-mode');
		zeditor.button(editor_options);
		for (var a = $(editor_message), i = 0, l = a.length; i < l; i++) {
			a[i].innerHTML = zeditor.replace(a[i].innerHTML)
		}
	},
	load: function () {
		$(editor_options + ' a[href*="quote"], ' + editor_options + ' a[href*="editpost"]').click(function (a) {
			if (this.href.indexOf('quote') > 0) {
				post_url = post_url = $('a[href^="/post?t="]').first().attr("href")
			} else {
				post_url = this.href
			}
			$('#ze-edit').load(this.href + ' textarea:last', function () {
				textarea.value = document.getElementById('ze-edit').firstChild.value;
				textarea.focus();
				zeditor.loading('off')
			});
			a.preventDefault();
			zeditor.loading('on')
		})
	},
	button: function (where) {
		$(where).each(function () {
			$(this).find('a[href*="quote"]').attr('onclick', 'zeditor.start(\'quote\', this)').before('<a class="pbutton" href="#reply" onclick="zeditor.start(\'reply\', this)">' + lang.reply_button + '</a>');
			$(this).find('a[href*="editpost"]').attr('onclick', 'zeditor.start(\'edit\', this)')
		});
		zeditor.load()
	},
	start: function (a, dom) {
		$('#ze-editor').appendTo($(dom).parents(editor_post).find('.zeditor'));
		document.getElementById('ze-editor').style.display = 'block';
		switch (a) {
		case "reply":
			post_url = $('a[href^="/post?t="]').first().attr("href");
			editor_mode.innerHTML = lang.reply;
			break;
		case "quote":
			editor_mode.innerHTML = lang.quote;
			break;
		case "edit":
			editor_mode.innerHTML = lang.edit;
			break
		}
	},
	add: function (x, y) {
		textarea.focus();
		if (typeof (textarea) != "undefined") {
			var longueur = parseInt(textarea.value.length);
			var selStart = textarea.selectionStart;
			var selEnd = textarea.selectionEnd;
			textarea.value = textarea.value.substring(0, selStart) + x + textarea.value.substring(selStart, selEnd) + y + textarea.value.substring(selEnd, longueur)
		} else textarea.value += x + y;
		textarea.focus()
	},
	preview: function (a) {
		preview = document.getElementById('ze-preview');
		if (preview.style.display == 'block') {
			preview.style.display = 'none';
			document.getElementById('editor-top').setAttribute('style', 'height:38px; transform: scaleY(1);-webkit-transform: scaleY(1)');
			a.innerHTML = lang.preview_button
		} else {
			a.innerHTML = lang.close_button;
			document.getElementById('editor-top').setAttribute('style', 'height:3px; transform: scaleY(0);-webkit-transform: scaleY(0)');
			$.post(post_url, {
				"message": textarea.value,
				"preview": "Preview",
			}, function (data) {
				preview.style.display = 'block';
				preview.innerHTML = zeditor.replace($(data).find(editor_preview).html())
			})
		}
	},
	preview_close: function (a) {
		$(a).hide();
		document.getElementById('editor-preview-button').innerHTML = lang.preview_button;
		document.getElementById('editor-top').setAttribute('height:38px; transform: scaleY(1);-webkit-transform:scaleY(1)');
	},
	post: function () {
		$.post(post_url, {
			"message": textarea.value,
			"post": "Send",
		}, function (data) {
			var en = "Your message has been entered successfully";
			vi = "Bài c?a b?n ð? ðý?c chuy?n";
			b = (data.indexOf(en) < 0) ? vi : en;
			index = data.indexOf(b);
			if (data.indexOf("Flood control") > 0) {
				alert(lang.flood_message)
			} else if (data.indexOf('A new message') > 0) {
				$.post('/post', $(data).find("form[name='post']").serialize() + '&post=1', function (c) {
					(index < 0) ? alert(lang.error_message) : zeditor.newpost($(c).find('p:contains("' + b + '") a:first').attr('href'))
				})
			} else {
				(index < 0) ? alert(lang.error_message) : zeditor.newpost($(data).find('p:contains("' + b + '") a:first').attr('href'))
			}
		})
	},
	newpost: function (a) {
		var b = a.split('#')[1];
		document.getElementById('ze-editor').style.display = 'none';
		if (editor_mode.innerHTML == lang.reply || editor_mode.innerHTML == lang.quote) {
			$('<div class="zeditor-new"></div>').insertAfter(editor_post + ':last').load(a + " #p" + b, function () {
				zeditor.button(editor_options + ':last');
				$('.zeditor-new').hide().fadeIn('2000')
			})
		}
		if (editor_mode.innerHTML == lang.edit) {
			$('#ze-editor').parents(editor_post).find(editor_message).load(a + ' #p' + b + ' ' + editor_message + ' > *', function () {
				$('#ze-editor').parents(editor_post).find(editor_message).hide().fadeIn('slow');
				zeditor.button(editor_options + ':last')
			})
		}
		textarea.value = ''
	},
	popup: function (a, b) {
		$('#' + b).siblings().hide();
		x = document.getElementById(b);
		if (x.style.display == 'none') {
			x.style.display = 'block'
		} else {
			x.style.display = 'none'
		}
		y = document.getElementById('editor-button-active');
		y == null ? (a.id = 'editor-button-active') : ($('.editor-button-outer').removeAttr('id'), (a.id = 'editor-button-active') ? (a.removeAttribute('id')) : (a.id = 'editor-button-active'));
		switch (b) {
		case "ze-color":
			var c = '<table cellspacing="0" id="ze-color-inner">';
			var colors = new Array('00', '33', '66', '99', 'CC', 'FF');
			for (i = 5; i >= 0; i--) {
				c = c + '<tr>';
				for (j = 5; j >= 0; j--) {
					for (k = 5; k >= 0; k--) {
						var col = colors[j] + colors[i] + colors[k];
						c = c + '<td style="background: #' + col + '" title="#' + col + '"><div style="background:#' + col + '" onclick="zeditor.add(\'[color=#' + col + ']\', \'[/color]\');zeditor.color(this)"></div></td>'
					}
				}
				c = c + '</tr>'
			}
			document.getElementById('ze-color').innerHTML = c + '</table>';
			break;
		case "ze-smiley":
			smiley = document.getElementById('ze-smiley');
			if (smiley.innerHTML == '') {
				$(smiley).load('/smilies.forum?mode=smilies_frame', function () {
					this.innerHTML = this.innerHTML.replace(/alt=\"(.*?)\"/g, 'onclick="zeditor.smiley(\'$1\')"')
				})
			}
			break
		}
	},
	color: function (a) {
		document.getElementById('ze-color').setAttribute('style', 'display:none')
	},
	smiley: function (a) {
		textarea.value += a;
		textarea.focus();
		document.getElementById('ze-smiley').style.display = 'none'
	},
	tag: function (a) {
		var e = $(a).parents(editor_post).find('a[href^="/u"]').eq(1).text();
		document.getElementById('editor-textarea').value += '[tag]' + e + '[/tag]';
		if (e.length > 0) {
			if (confirm(lang.notify_message + ' ' + e + '?') == true) {
				$.post('/privmsg?mode=post&post=1', {
					'username[]': e,
					'subject': 'You have been mentioned by ' + e,
					'message': 'You have been mentioned in the following post - [url=' + window.location + ']' + document.title + '[/url]',
					'post': 'Send',
					'folder': 'inbox'
				});
				alert('Done')
			}
		}
	},
	replace: function (a) {
		return a.replace(/\[tag\](.*?)\[\/tag\]/g, function (a, b) {
			return '<a href="/profile?mode=viewprofile&u=' + b.replace(/ /g, "+") + '">@' + b + '</a>'
		})
	},
	loading: function (a) {
		b = document.getElementById('editor-loading');
		a == 'on' ? (b.style.display = '') : (b.style.display = 'none')
	},
};
document.write('<div id="ze-editor" style="display:none"><div id="ze-edit" style="display:none"></div><form id="ze-editor-form" name="ze-editor" method="post" action="/post"><div id="editor-top"><div id="editor-tool"><span onclick="zeditor.add(\'[b]\',\'[/b]\')" class="editor-button-outer">' + lang.bold_button + '</span><span onclick="zeditor.add(\'[i]\',\'[/i]\')"  class="editor-button-outer">' + lang.italic_button + '</span><span onclick="zeditor.add(\'[u]\',\'[/u]\')"  class="editor-button-outer">' + lang.underline_button + '</span><span onclick="zeditor.add(\'[strike]\',\'[/strike]\')"  class="editor-button-outer">' + lang.strike_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(this, \'ze-color\')">' + lang.color_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(this, \'ze-smiley\')">' + lang.smiley_button + '</span><span class="editor-button-outer" onclick="zeditor.tag(this)">' + lang.tag_button + '</span></div><div id="editor-copyright"><a href="http://devs.forumvi.com/t88-topic">zEditor 1.3.1</a></div></div><div id="ze-popups"><div id="ze-color" style="display:none"></div><div id="ze-smiley" style="display:none"></div></div><div id="outer-preview"><div id="ze-preview" ondblclick="zeditor.preview_close(this)"></div><div id="editor-loading" style="display: none"><img src="http://i11.servimg.com/u/f11/16/80/27/29/ajax-l10.gif" /><br>' + lang.loading + '</div><textarea name="message" id="editor-textarea"></textarea></div><div id="editor-data"><input type="hidden" value="" name="attach_sig"><input type="hidden" value="reply" name="mode"><input type="hidden" value="" name="lt"><input type="hidden" value="1" name="notify"></div><div id="editor-post-tool"><div id="editor-post-button"><span  id="editor-send-button" onclick="zeditor.post()">Send</span><span onclick="zeditor.preview(this)" id="editor-preview-button">' + lang.preview_button + '</span></div><div id="editor-mode"></div></div></form></div>');
$(function () {
	zeditor.ready()
});