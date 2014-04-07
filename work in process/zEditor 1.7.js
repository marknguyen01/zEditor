var zeditor = {
	version: 'punbb', // punbb or phpbb3 or invision
	lang: {
		reply: "Mode: Reply",
		pm: "Mode: Private Message",
		edit: "Mode: Edit",
		quote: "Mode: Quote",
		preview: "Mode: Preview",
		loading: "Loading...",
		flood_message: "You cannot send 2 posts at the same. Please wait",
		error_message: "An unexpected error has occurred. Please refresh the page",
		notify_message: "Would you like to notify",
		quote_message: "at Post",
		tag_message_title: "You've been tagged in",
		tag_message_error: "zEditor can\'t find the name of the user whom you want to tag",
		pm_message_title: "A message from a topic named",
		pm_message_error: "zEditor can't find the name of the user whom you want to send a private message to",
		reply_button: "Reply",
		pm_button: "PM",
		preview_button: "Preview",
		advance_button: "Advanced",
		close_button: "Close",
		bold_button: "Bold",
		italic_button: "Italic",
		strike_button: "Strike",
		underline_button: "Underline",
		color_button: "Color",
		smiley_button: "Smilies",
		image_button: "Image",
                upload_button: "Upload",
		tag_button: "Tag"
	},
	editor: 0,
	mode: 0,
	url: 0,
	textarea: 0,
	post_dom: 0,
	message_dom: 0,
	preview_dom: 0,
	button_dom: 0,
	ready: function () {
		zeditor.post_dom = '.post';
		if (zeditor.version == 'punbb') {
			zeditor.message_dom = '.zeditor';
			zeditor.preview_dom = '.entry-content';
			zeditor.button_dom = '.post-options'
		}
		if (zeditor.version == 'phpbb3') {
			zeditor.preview_dom = zeditor.message_dom = '.content';
			zeditor.button_dom = '.profile-icons'
		}
		if (zeditor.version == 'invision') {
			zeditor.preview_dom = zeditor.message_dom = '.post-entry';
			zeditor.button_dom = '.posting-icons'
		}
		$('.h3:contains("Quick reply:")').remove();
		if (document.getElementById('ze-copyright') == null) {
			$('#ze-editor').remove();
			alert('Please put back the copyright button to use zEditor');
		}
		zeditor.textarea = document.getElementById('editor-textarea');
		zeditor.subject = document.getElementById('editor-subject');
		zeditor.mode = document.getElementById('editor-mode').getElementsByTagName('span')[1];
		zeditor.editor = document.getElementById('ze-editor');
		zeditor.button(zeditor.button_dom);
		for (var a = $(zeditor.message_dom), i = 0, l = a.length; i < l; i++) {
			a[i].innerHTML = zeditor.replace(a[i].innerHTML)
		}
	},
	quote: function (a) {
		zeditor.loading('on');
		$.get(a.href, function (data) {
			zeditor.textarea.value = $(data).find('#text_editor_textarea').val().replace(/]/, '][link="' + location.pathname + '#' + a.href.match(/[0-9]+/) + '"]');
			zeditor.textarea.focus();
			zeditor.loading('off')
		});
	},
	edit: function (a) {
		zeditor.loading('on');
		zeditor.url = a.href;
		$.get(a.href, function (data) {
			zeditor.textarea.value = $(data).find('#text_editor_textarea').val();
			zeditor.subject.value = $(data).find('input[name="subject"]').val();
			zeditor.textarea.focus();
			zeditor.loading('off')
		});
	},
	button: function (where) {
		$(where).each(function () {
			$(this).find('a[href*="quote"]').attr('onclick', 'zeditor.start(\'quote\', this); return false').parent().prepend('<a class="pbutton" onclick="zeditor.start(\'reply\', this)">' + zeditor.lang.reply_button + '</a><a class="pbutton" onclick="zeditor.start(\'pm\', this)">' + zeditor.lang.pm_button + '</a>');
			$(this).find('a[href*="editpost"]').attr('onclick', 'zeditor.start(\'edit\', this); return false')
		});
	},
	start: function (a, dom) {
		$(zeditor.editor).appendTo($(dom).parents(zeditor.post_dom).find(zeditor.message_dom));
		$(zeditor.editor).slideDown();
		switch (a) {
		case "reply":
			zeditor.url = $('a[href^="/post?t="]').first().attr("href");
			zeditor.mode.innerHTML = zeditor.lang.reply;
			break;
		case "quote":
			zeditor.url = dom.href;
			zeditor.quote(dom);
			zeditor.mode.innerHTML = zeditor.lang.quote;
			break;
		case "edit":
			zeditor.edit(dom);
			zeditor.mode.innerHTML = zeditor.lang.edit;
			break;
		case "pm":
			zeditor.url = !1;
			zeditor.mode.innerHTML = zeditor.lang.pm;
			break;
		}
	},
	add: function (x, y) {
		zeditor.textarea.focus();
		if (typeof (zeditor.textarea) != "undefined") {
			var longueur = parseInt(zeditor.textarea.value.length);
			var selStart = zeditor.textarea.selectionStart;
			var selEnd = zeditor.textarea.selectionEnd;
			zeditor.textarea.value = zeditor.textarea.value.substring(0, selStart) + x + zeditor.textarea.value.substring(selStart, selEnd) + y + zeditor.textarea.value.substring(selEnd, longueur)
		} else zeditor.textarea.value += x + y;
		zeditor.textarea.focus()
	},
	preview: function (a) {
		preview = document.getElementById('ze-preview');
		if (preview.style.display == 'block') {
			preview.style.display = 'none';
			document.getElementById('editor-top').setAttribute('style', 'height:38px; transform: scaleY(1);-webkit-transform: scaleY(1)');
			a.innerHTML = zeditor.lang.preview_button
		} else {
			a.innerHTML = zeditor.lang.close_button;
			document.getElementById('editor-top').setAttribute('style', 'height:3px; transform: scaleY(0);-webkit-transform: scaleY(0)');
			$.post(zeditor.url, {
				"message": zeditor.textarea.value,
				"preview": "Preview",
			}, function (data) {
				preview.style.display = 'block';
				preview.innerHTML = zeditor.replace($(data).find(zeditor.preview_dom).html())
			})
		}
	},
	closePreview: function (a) {
		$(a).hide();
		zeditor.textarea.focus();
		document.getElementById('editor-preview-button').innerHTML = zeditor.lang.preview_button;
		document.getElementById('editor-top').setAttribute('style', 'height:38px; transform: scaleY(1);-webkit-transform:scaleY(1)');
	},
	post: function (a) {
		if (zeditor.mode.innerHTML == zeditor.lang.quote) {
			zeditor.url = $('a[href^="/post?t="]').first().attr("href")
		}
		if (zeditor.url) {
			$.post(zeditor.url, {
				'post': 'Send',
				'message': zeditor.textarea.value,
				'subject': zeditor.subject.value
			}, function (data) {
				var en = "Your message has been entered successfully";
				vi = "Bài của bạn đã được chuyển";
				b = (data.indexOf(en) < 0) ? vi : en;
				index = data.indexOf(b);
				if (data.indexOf("Flood control") > 0) {
					alert(zeditor.lang.flood_message)
				} else if (data.indexOf('A new message') > 0) {
					$.post('/post', $(data).find("form[name='post']").serialize() + '&post=1', function (c) {
						(index < 0) ? alert(zeditor.lang.error_message) : zeditor.newPost($(c).find('p:contains("' + b + '") a:first').attr('href'))
					})
				} else {
					(index < 0) ? alert(zeditor.lang.error_message) : zeditor.newPost($(data).find('p:contains("' + b + '") a:first').attr('href'))
				}
			})
		} else {
			zeditor.pm(a)
		}
	},
	newPost: function (a) {
		var b = a.split('#')[1];
		zeditor.editor.style.display = 'none';
		if (zeditor.mode.innerHTML == zeditor.lang.reply || zeditor.mode.innerHTML == zeditor.lang.quote) {
			$.get(a, function (data) {
				$('<div class="zeditor-new">' + zeditor.replace($(data).find("#p" + b).wrapAll('<div></div>').parent().html()) + '</div>').insertAfter(zeditor.post_dom + ':last');
				$('html,body').animate({
					scrollTop: $('.zeditor-new:last').offset().top
				}, 600);
				zeditor.button('.zeditor-new:last ' + zeditor.button_dom);
			});
		}
		if (zeditor.mode.innerHTML == zeditor.lang.edit) {
			dom = $(zeditor.editor).parents(zeditor.post_dom).find(zeditor.message_dom);
			$.get(a, function (data) {
				$(dom).html(zeditor.replace($(data).find('#p' + b + ' ' + zeditor.message_dom).html()));
				$(dom).hide().fadeIn('slow');
			})
		}
		zeditor.textarea.value = '';
	},
	popup: function (a, b) {
		zeditor.textarea.focus();
		x = document.getElementById(a);
		y = document.getElementById('ze-editor').offsetWidth;
		if (x.style.display == 'none') {
			position = b.offsetX === undefined ? b.layerX - 50 : b.offsetX - 50;
			x.setAttribute('style', 'display: block; left: ' + position + 'px');
			if (position + x.offsetWidth + 20 > y) {
				position = position - 40;
			}
			x.style.left = position + 'px';
		} else {
			x.style.display = 'none';
		}
		$('#' + a).siblings().hide();
	},
	createSmilies: function () {
		smiley = document.getElementById('ze-smiley');
		if (smiley.innerHTML == '') {
			$(smiley).load('/smilies.forum?mode=smilies_frame', function () {
				this.innerHTML = this.innerHTML.replace(/alt=\"(.*?)\"/g, 'onclick="zeditor.smiley(\'$1\')"')
			})
		}
	},
	createColor: function () {
		if (!document.getElementById('ze-color-inner')) {
			var c = '<table cellspacing="0" id="ze-color-inner">';
			var colors = new Array('00', '33', '66', '99', 'CC', 'FF');
			for (i = 5; i >= 0; i--) {
				c = c + '<tr>';
				for (j = 5; j >= 0; j--) {
					for (k = 5; k >= 0; k--) {
						var col = colors[j] + colors[i] + colors[k];
						c = c + '<td style="background: #' + col + '" title="#' + col + '"><div style="background:#' + col + '" onclick="zeditor.add(\'[color=#' + col + ']\', \'[/color]\');zeditor.hideColor()"></div></td>'
					}
				}
				c = c + '</tr>'
			}
			document.getElementById('ze-color').innerHTML = c + '</table><div id="ze-color-info"><div class="ze-color-input"><div>#</div><input id="ze-color-hex" maxlength="6" onkeypress="zeditor.convertHex(this)" placeholder="000000"></div><div class="ze-color-input"><div>R</div><input id="ze-color-r" maxlength="3" onkeypress="zeditor.convertRGB()" placeholder="000"></div><div class="ze-color-input"><div>G</div><input id="ze-color-g" maxlength="3" onkeypress="zeditor.convertRGB()" placeholder="000"></div><div class="ze-color-input"><div>B</div><input id="ze-color-b" maxlength="3" onkeypress="zeditor.convertRGB()" placeholder="000"></div><div class="editor-button-confirm" onclick="zeditor.submitColor()">OK</div></div>';
		}
	},
	hideColor: function () {
		document.getElementById('ze-color').setAttribute('style', 'display:none')
	},
	submitColor: function () {
		if (document.getElementById('ze-color-hex').value !== '') {
			zeditor.add('[color=#' + document.getElementById('ze-color-hex').value + ']', '[/color]');
		} else {
			zeditor.add('[color=#000000]', '[/color]');
		}
		zeditor.hideColor();
	},
	convertHex: function (a) {
		var a = a.value,
			result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
		result ? (document.getElementById('ze-color-r').value = parseInt(result[1], 16), document.getElementById('ze-color-g').value = parseInt(result[2], 16), document.getElementById('ze-color-b').value = parseInt(result[3], 16)) : null
	},
	convertRGB: function () {
		var r = document.getElementById('ze-color-r').value,
			g = document.getElementById('ze-color-g').value,
			b = document.getElementById('ze-color-b').value,
			rgb = b | (g << 8) | (r << 16);
		document.getElementById('ze-color-hex').value = (0x1000000 + rgb).toString(16).slice(1);
	},
	smiley: function (a) {
		zeditor.textarea.value += a;
		zeditor.textarea.focus();
		document.getElementById('ze-smiley').style.display = 'none'
	},
	tag: function (a) {
		var e = $(a).parents(zeditor.post_dom).find('a[href^="/u"]:not(:empty)').eq(0).text(); // eq(1)
		zeditor.textarea.value += '[tag]' + e + '[/tag]';
		if (e.length > 0) {
			if (confirm(zeditor.lang.notify_message + ' ' + e + '?')) {
				zeditor.post_pm(e, zeditor.lang.tag_message_title + ' "' + document.title + '"', zeditor.textarea.value);
			}
		} else {
			alert(zeditor.lang.tag_message_error)
		}
	},
	pm: function (a) {
		var e = $(a).parents(zeditor.post_dom).find('a[href^="/u"]:not(:empty)').eq(0).text(); // eq(1)
		if (e.length > 0) {
			zeditor.post_pm(e, zeditor.lang.pm_message_title + ' "' + document.title + '"', zeditor.textarea.value);
		} else {
			alert(zeditor.lang.pm_message_error)
		}
		zeditor.textarea.value = '';
	},
	post_pm: function (name, subject, message) {
		$.post('/privmsg?mode=post&post=1', {
			'username[]': name,
			'subject': subject,
			'message': message,
			'post': 'Send',
			'folder': 'inbox'
		}, function () {
			alert('Sent');
		});
	},
	replace: function (a) {
		return a.replace(/\[tag\](.*?)\[\/tag\]/g, function (a, b) {
			return '<a href="/profile?mode=viewprofile&u=' + b.replace(/ /g, "+") + '" onmouseover="zeditor.avatar(this, this.href)" class="ze-avatar">@' + b + '</a>'
		}).replace(/:<\/cite>\[link="(\S+)"\]/gi, function (a, b) {
			return ' ' + zeditor.lang.quote_message + ' <a href="' + b + '"> ' + b.split("#")[1] + '</a></cite>'
		})
	},
	copyright: function () {
		if (confirm("zEditor 1.7 by Zero\nClick OK for more details")) {
			window.open('https://github.com/mysticzero/zEditor/blob/master/README.md');
		}
	},
	loading: function (a) {
		b = document.getElementById('editor-loading');
		a == 'on' ? (b.style.display = '') : (b.style.display = 'none')
	},
	advance: function () {
		if (confirm("All your current progress will be lost. Click OK to continue")) {
			location.href = zeditor.url;
		}
	},
	avatar: function (a, b) {
		if (a.getElementsByTagName('span')[0] == null) {
			$.get(b, function (data) {
				a.innerHTML += '<span>' + $(data).find('#profile-advanced-right img:first')[0].outerHTML + '</span>'
			});
		}
	}
};
document.write('<div id="ze-editor" style="display:none"><form id="ze-editor-form" name="ze-editor" method="post" action="/post"><div id="editor-top"><div id="editor-tool"><span onclick="zeditor.add(\'[b]\',\'[/b]\')" class="editor-button-outer">' + zeditor.lang.bold_button + '</span><span onclick="zeditor.add(\'[i]\',\'[/i]\')"  class="editor-button-outer">' + zeditor.lang.italic_button + '</span><span onclick="zeditor.add(\'[u]\',\'[/u]\')"  class="editor-button-outer">' + zeditor.lang.underline_button + '</span><span onclick="zeditor.add(\'[strike]\',\'[/strike]\')"  class="editor-button-outer">' + zeditor.lang.strike_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(\'ze-color\', event);zeditor.createColor()">' + zeditor.lang.color_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(\'ze-smiley\', event);zeditor.createSmilies()">' + zeditor.lang.smiley_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(\'ze-image\', event)">' + zeditor.lang.image_button + '</span><span class="editor-button-outer" onclick="zeditor.popup(\'ze-upload\', event)">' + zeditor.lang.upload_button + '</span><span class="editor-button-outer" onclick="zeditor.tag(this)">' + zeditor.lang.tag_button + '</span><span class="editor-button-outer" onclick="zeditor.copyright()" id="ze-copyright">?</span></div></div><div id="ze-popups"><div id="ze-subject" class="ze-popups" style="display:none"><input id="editor-subject" type="text"></input></div><div id="ze-mode" class="ze-popups" style="display:none"><p><center>Choose your theme</center></p><p><input type="radio" name="ze-mode" checked="checked"> Light grey</input><p></div><div id="ze-color" class="ze-popups" style="display:none"></div><div id="ze-smiley" class="ze-popups" style="display:none"></div><div id="ze-image" class="ze-popups" style="display:none"><input type="text" style="height:20px;border:1px solid #BDBDBD" /><div><br><span class="editor-button-confirm" onclick="zeditor.popup(\'ze-image\', event);zeditor.add(\'[img]\'+this.parentNode.previousSibling.value, \'[/img]\');this.parentNode.previousSibling.value=\'\'">OK</span></div></div><div id="ze-upload" class="ze-popups"  style="display:none"><iframe src="http://imageshack.us/syndicate/widget.php" frameborder="0" scrolling="no"></iframe></div></div><div id="outer-preview"><div id="ze-preview" ondblclick="zeditor.closePreview(this)"></div><div id="editor-loading" style="display: none"><img src="http://i11.servimg.com/u/f11/16/80/27/29/ajax-l10.gif" /><br>' + zeditor.lang.loading + '</div><textarea name="message" id="editor-textarea"></textarea></div><div id="editor-data"><input type="hidden" value="reply" name="mode"><input type="hidden" value="1" name="notify"></div><div id="editor-post-tool"><div id="editor-post-button"><span  id="editor-send-button" onclick="zeditor.post(this)">Send</span><span onclick="zeditor.preview(this)" id="editor-preview-button">' + zeditor.lang.preview_button + '</span><span onclick="zeditor.advance()">' + zeditor.lang.advance_button + '</span></div><div id="editor-mode"><span onclick="zeditor.popup(\'ze-subject\', event)">Subject</span><span onclick="zeditor.popup(\'ze-mode\', event)"></span></div></div></form></div>');
$(function () {
	zeditor.ready()
});