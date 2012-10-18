/* Carmen Johnson
   MiU Project 2
   9/6/2012
*/

var items;
var pageScroll;



$db = $.couch.db("asd3dborg");

$('#homePage').on('pageinit', 
function()
{
	// Keep track of the page position
	pageScroll = $(window).scrollTop();
	
	// Make sure we don't have any empty items
	
	$("#homePage").page();
	$("#addItemPage").page();
		
	// Show an item
	$("#itemList").on("click", ".item-link", function(){viewItem($(this).attr("name"));});
	
	initializeList();
	
	$(document).bind("pagechange", function(e, data) {
		// Only worry about the 'viewItem' page
		// Scroll to where the user was
		if(data.toPage[0] == $("#viewItem")[0]) {
			$.mobile.silentScroll(pageScroll);
		}
	});
	
});


$('#addItemPage').on('pageinit', 
function()
{
	var myForm = $('#addItemForm');
	myForm.validate({
	
			rules: {
					category: "required",
					itemName: "required",
					quantity: {required:true, digits: true},
					itemDate: {required:true, date:true},
					comments: "required"
				  },
			messages: {
						category: "Please select a category.",
						itemName: "Name is required",
						quantity: {required:"Quantity is required", digits:"Quantity must be numeric"},
						itemDate: {required:"Date is required", date:"Date must be in yyyy-mm-dd format"},
						comments: "Comment is required"
					},
			errorPlacement: function(error, element) {
				if(element.attr("id") == "category")
					error.insertAfter(element.parent().parent());
				else if(element.attr("id") == "itemDate")
					error.insertAfter(element.parent());
				else
					error.insertAfter(element);
 		    },
			invalidHandler: function(form, validator) {
			},
			submitHandler: function() {
			var data = myForm.serializeArray();
			var idno = storeData(data);
		}
	});
	
});


$('#viewItemPage').on('pageinit', 
function()
{
	$("#editItemPage").page();
	$("#editItemButton").click(function()
	{	
		var itemId = $(this).attr("name");
		
		var itemIndex = getItemIndex(itemId);
		var item = items[itemIndex];
		$("#editItemPage [name='category']").val(item.category);
		$("#editItemPage [name='itemName']").val(item.name);
		
		
		$("#editItemPage [name='quantity']").val(item.quantity).slider('refresh');
		
		$("#editItemPage [name='itemDate']").val(item.date);
		
		$("#editItemPage [name='comments']").val(item.comments);
		
		
		$("#editItemPage [name='important']").prop("checked", item.important).checkboxradio('refresh');
		
		$("#editItemPage #update").attr("name", item.idno);
		
		$("#editItemPage [name='itemId']").val(item.idno);
		
	});
});


$('#editItemPage').on('pageinit', 
function()
{

	var myForm = $('#editItemForm');
	myForm.validate({
	
			rules: {
					category: "required",
					itemName: "required",
					quantity: {required:true, digits: true},
					itemDate: {required:true, date:true},
					comments: "required"
				  },
			messages: {
						category: "Please select a category.",
						itemName: "Name is required",
						quantity: {required:"Quantity is required", digits:"Quantity must be numeric"},
						itemDate: {required:"Date is required", date:"Date must be in yyyy-mm-dd format"},
						comments: "Comment is required"
					},
			errorPlacement: function(error, element) {
				if(element.attr("id") == "category")
					error.insertAfter(element.parent().parent());
				else if(element.attr("id") == "itemDate")
					error.insertAfter(element.parent());
				else
					error.insertAfter(element);
 		    },
	
			invalidHandler: function(form, validator) {
			},
			submitHandler: function() {
			var data = myForm.serializeArray();
			updateData(data);
		    
		}
	});
	
});


var loadFromCouchDB = function()
{
	var its = new Array();
	$.ajax({
	  url: '_view/items',    
	  dataType: 'json', 
	  async: false,
	  success: function(json)
			   {
				var rows = json.rows;
				for(var i=0;i<rows.length;i++)
				{
					its[i]=rows[i].value;
				}
			   },
	  error: 
		function(jqXHR, textStatus, errorThrown) 
		{
			alert("error " + textStatus);
			alert("incoming Text " + jqXHR.responseText);
		}
	});
	return its;
}



var initializeList = function initializeList() {
		items = loadFromCouchDB();
		items = jQuery.grep(items, function(n) { return n; });
		// Sort the items alphabetically
		items.sort(function(a, b) {
			if(b == null)
				return -1;
			else if(a == null)
				return 1;
			
			for(var i = 0; i < a.name.length && i < b.name.length; i++) {
				if(a.name[i].toUpperCase() < b.name[i].toUpperCase())
					return -1;
				else if(b.name[i].toUpperCase() < a.name[i].toUpperCase())
					return 1;
			}
			
			if(a.name.length < b.name.length)
				return -1;
			else if(b.name.length < a.name.length)
				return 1;
			else
				return 0;
		});
		
		// Add the items to the list
		$("#itemList").empty();
		for(var i = 0; i < items.length; i++) {
			var item = items[i];
			if(item == null)
				continue;
			
			
					
			var link = $("<a></a>");
			link.attr("href", "#viewItemPage");
			link.attr("name" ,item.idno);
			link.attr("class", "item-link");
			var listItem = $("<li></li>");
			listItem.attr("data-filtertext", item.name + " " + item.category);
			var image = $("<img />");
			image.attr("src", "images/" + item.category + ".png");
			var text = $("<h1></h1>");
			text.attr("class", "item-text");
			text.html(item.name);
			
			var delIcon = $("<a></a>");
			delIcon.attr("class", "delItem");
			delIcon.attr("href","#");
			delIcon.attr("onclick", "javascript:deleteItem("+item.idno+");");
			delIcon.attr("data-role", "button");
			delIcon.attr("data-icon", "delete");
						
								
			link.append(image);
			link.append(text);
			listItem.append(link);
			listItem.append(delIcon);
			
			
			$("#itemList").append(listItem);
		}
		$("#itemList").listview('refresh');
	}

var storeData = function storeData(data)
				{
					if(data.length == 6)
					{
						var important = true;
						var comments = data[5].value;
					}
					else
					{
						var important = false;
						var comments = data[4].value;
					
					}
					var document = {
					category: data[0].value,
					name: data[1].value,
					quantity: data[2].value,
					idno: newID,
					date: data[3].value,
					comments: comments,
					important: important
					}
					saveDocument(document);
					var newID = getMaxId() + 1;
					return newID;
				};

var saveDocument=function(document)
		{
			$db.saveDoc( document, {
				success: function( response )  {
					initializeList();
					viewItem(document.idno);
					$.mobile.changePage("#viewItemPage");
					showPopupMessage("Database updated!!");
				},
				error: function() {
					alert( "Cannot save document!! ");
					}
			});
		};
				
var updateData = function updateData(data)
				{
					var importannt;
					var comments;
					
					if(data.length == 7)
					{
						important = true;
						comments = data[6].value;
					}
					else
					{
						important = false;
						comments = data[5].value;
					
					}
									
					var itemIndex = getItemIndex(data[0].value);
					var item = items[itemIndex];
					item.category= data[1].value,
					item.name= data[2].value,
					item.quantity= data[3].value,
					item.date= data[4].value,
					item.important= important,
					item.comments= comments
					
					$db.openDoc(item._id,
						{
							success:function(document){
								document.category = item.category;
								document.name = item.name;
								document.quantity = item.quantity;
								document.date = item.date;
								document.important = item.important;
								document.comments = item.comments
								if(saveDocument(document))
									alert("update successful");
							},
							error:function(){
								alert("Could not open the document");
							}
						}
					);
				}
			
var getData = function getData(idno)
{
	var index = getItemIndex(idno);
	return items[index];
}

			
var makeTitleCase = function(arg) {
		if (arg.length >= 1)
			return (arg.substr(0,1).toUpperCase() + arg.substr(1, arg.length));
		else return arg;
	};

	
var viewItem = function viewItem(idno) 
	{
	
		// Save the scroll position
		pageScroll = $(window).scrollTop();
		
		// Get the item they clicked on
		var item = getData(idno);
				
		$("#itemView img").attr("src", "images/" + item.category + ".png");
		$("#itemView [name='category'] span").text(makeTitleCase(item.category));
		$("#itemView [name='name'] span").text(item.name);
		$("#itemView [name='quantity'] span").text(item.quantity);
		$("#itemView [name='date'] span").text(item.date);
		$("#itemView [name='comments'] span").text(item.comments);
		if(item.important) {
			$("#itemView [name='important']").css("display", "block");
			$("#itemView [name='comments']").removeClass('ui-corner-bottom ui-li-last');
		}
		else {
			$("#itemView [name='important']").css("display", "none");
			$("#itemView [name='comments']").addClass('ui-corner-bottom ui-li-last');
		}
		//*********
		$('#editItemButton').attr("name", item.idno);
		
	}

	
var deleteItem = function deleteItem(idno)
	{
		var res = confirm("Are you sure?");
		if(!res)
			return;
		var len = items.length;
		var item;
		for(var i=0;i<len;i++)
		{
			if(items[i].idno == idno)
			{
				item = items[i];
				break;
			}
		}
		$db.openDoc( item._id, {
            success: function( document ) {
                
                $db.removeDoc( document, {
                    success: function() {
						showPopupMessage("Database updated!!");
                        initializeList();
                    },
                    error: function() {
                        alert( "Could not remove document");
                    }
                });
            },
            error: function() {
                alert( "Could not find document");
            }
        });
		
	}
	
var getItemIndex = function getItemIndex(idno)
	{
		var len = items.length;
		for(var i=0;i<len;i++)
		{
			if(items[i].idno == idno)
			{
				return i;
				break;
			}
		}
	}
	
var getMaxId = function getMaxId()
	{
		var maxId=items[0].idno;
		var len = items.length;
		for(i=1;i<len;i++)
		{
			if(items[i].idno > maxId)
				maxId = items[i].idno;
		}
		return maxId;
	}
	
	
var showPopupMessage = function showPopupMessage(msg)
{
	$(".ui-slider-handle").css("z-index","100");
    $("<div class='ui-overlay-shadow"+
    " ui-body-e ui-corner-all'>"+
    msg+    
    "</div>").
    css({ "display": "block",
        "margin-top":"25%",
		"z-index":"99999999",
		"margin-left":"10%",
		"margin-right":"10%",
		"padding":"10px",
        "postion":"fixed",
        "text-align":"center",
        "opacity": 0.96})
      .appendTo($("body") )
      .delay( 1500 )
      .fadeOut( 400, function(){
        $(this).remove();
      });
}


var clearAddFields = function clearAddFields()
{
	$('#addItemPage .errMessage').hide();
	$("#addItemPage [name='category']").val("");
	
	$("#addItemPage [name='itemName']").val("");
	$("#addItemPage [name='quantity']").val(1);
	var d = new Date();
	if(d.getMonth()<9)
		newM = "0" + (d.getMonth()+1);
	else
		newM = d.getMonth()+1;
	if(d.getDate()<=9)
		newD = "0" + (d.getDate());
	else
		newD = d.getDate();
	var strDate = d.getFullYear() + "-" +  newM + "-" + newD;
	$("#addItemPage [name='itemDate']").val(strDate);
	$("#addItemPage [name='comments']").val("");;
	$("#addItemPage [name='important']").prop("checked", false);
	
	$("#addItemPage [name='quantity']").slider('refresh');
	$("#addItemPage [name='important']").checkboxradio('refresh');
}
	
	
